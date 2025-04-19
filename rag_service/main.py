import json
import re

import demjson3
import requests
from fastapi import FastAPI, HTTPException

import shared.config
from shared.schema import RAGServiceQuery, RAGServiceResponse, LLMStructuredResponse
from shared.config import RAG_SERVICE_PORT
from shared.logger import get_logger
from rag_service.retriever import GitaRetriever
from rag_service.prompt_builder import build_prompt, format_shloka_for_context

app = FastAPI(
    title="DivineGPT - RAG Service",
    description="Provides answers based on Gita context using Retrieval-Augmented Generation.",
)
logger = get_logger("RAG Service")



# Define a fallback response
FALLBACK_RESPONSE = {
    "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    "meaning": "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results, and never be attached to not doing your duty.",
    "response": "My dear friend, I sense your question is important, but there seems to be a temporary challenge in how I'm processing it. Just as the Gita teaches us about perseverance through obstacles, I encourage you to try asking again. Sometimes the divine timing requires patience. The wisdom you seek is worth the effort. I'm here ready to guide you when you're ready to rephrase your question."
}



# --- Dependency Injection ---
try:
    shloka_retriever = GitaRetriever()
    logger.info("GitaRetriever initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing GitaRetriever: {e}")
    shloka_retriever = None

# --- API Endpoints ---

def parse_llm_response(llm_output_str: str) -> dict:
    """Safely parses JSON from LLM output with fallback strategies."""
    if not llm_output_str or llm_output_str.startswith("Error"):
        logger.warning("LLM returned an error or empty string.")
        return FALLBACK_RESPONSE

    # Step 1: Try to extract JSON block from markdown formatting or curly braces
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", llm_output_str, re.DOTALL)
    if match:
        llm_output_str = match.group(1)
    else:
        start = llm_output_str.find('{')
        end = llm_output_str.rfind('}')
        if start != -1 and end != -1 and start < end:
            llm_output_str = llm_output_str[start:end+1]

    cleaned_str = llm_output_str.replace('\n', ' ').replace('\r', '').strip()

    # Step 2: Try standard JSON parsing
    try:
        parsed = json.loads(cleaned_str)
        if _valid_json(parsed):
            return parsed
    except Exception as e:
        logger.warning(f"json.loads failed: {e}")

    # Step 3: Try demjson3 which is more tolerant
    try:
        parsed = demjson3.decode(cleaned_str)
        if _valid_json(parsed):
            return parsed
    except Exception as e:
        logger.error(f"demjson3 failed: {e}")
        logger.debug(f"Failed string: {llm_output_str[:500]}")

    return FALLBACK_RESPONSE

def _valid_json(data: dict) -> bool:
    return all(key in data for key in ["shloka", "meaning", "shloka_summary", "response", "reflection", "emotion"])


@app.post("/ask", response_model=RAGServiceResponse)
async def ask_question(user_query: RAGServiceQuery):
    """
    Receives a user query, retrieves relevant Gita shlokas,
    generates a prompt, gets a response from the LLM,
    and returns a structured JSON object.
    """
    if not shloka_retriever:
         raise HTTPException(status_code=503, detail="Retriever service is not available.")

    retrieved_payloads = shloka_retriever.get_relevant_shloka(user_query.query, top_k=1)

    if not retrieved_payloads:
        return RAGServiceResponse(
            user_query=user_query.query,
            retrieved_shlokas=[],
            llm_response=LLMStructuredResponse(
                shloka="",
                meaning="",
                shloka_summary="No shloka found for this query.",
                response="Please try asking differently",
                reflection="",
                emotion="neutral",
            )
        )

    context_string = "\n\n---\n\n".join([format_shloka_for_context(p) for p in retrieved_payloads])
    final_prompt = build_prompt(context=context_string, user_query=user_query.query, user_type=user_query.user_type)

    response = requests.post(
        f"http://localhost:{shared.config.LLM_SERVICE_PORT}/generate",
        json={"prompt": final_prompt},
        timeout=180,
    ).json()


    llm_response = response.get("response", "Error: LLM service returned no response")
    response = parse_llm_response(llm_response)
    llm_response=response.get("response", llm_response)

    return RAGServiceResponse(
        user_query=user_query.query,
        retrieved_shlokas=retrieved_payloads,
        llm_response=LLMStructuredResponse(**response),
    )

@app.get("/")
async def read_root():
    return {"message": "RAG Service Running", "port": RAG_SERVICE_PORT}

@app.get("/status")
async def get_status():
    retriever_status = "initialized" if shloka_retriever else "initialization_failed"
    return {
        "service": "RAG Service",
        "port": RAG_SERVICE_PORT,
        "status": "running",
        "retriever_status": retriever_status
        }

