from typing import Optional
import httpx
import json
import re
import demjson3
import requests
from fastapi import FastAPI, HTTPException

# import shared.config
from shared.schema import RAGServiceQuery, RAGServiceResponse, LLMStructuredResponse, RetrievedShloka
from shared.config import RAG_SERVICE_PORT, LLM_SERVICE_URL, QDRANT_URL, QDRANT_API_KEY, EMBEDDING_MODEL
from shared.logger import get_logger
from rag_service.retriever import ScriptureRetriever
from rag_service.prompt_builder import build_prompt, format_shloka_for_context
from fastapi.middleware.cors import CORSMiddleware
from rag_service.prompt_builder import build_simple_prompt

app = FastAPI(
    title="DivineGPT - RAG Service",
    description="Provides answers based on Gita context using Retrieval-Augmented Generation.",
)
logger = get_logger("RAG Service")
logger.info("Starting RAG Service...")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# # Define a fallback response
# FALLBACK_RESPONSE = {
#     "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
#     "meaning": "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results, and never be attached to not doing your duty.",
#     "response": "My dear friend, I sense your question is important, but there seems to be a temporary challenge in how I'm processing it. Just as the Gita teaches us about perseverance through obstacles, I encourage you to try asking again. Sometimes the divine timing requires patience. The wisdom you seek is worth the effort. I'm here ready to guide you when you're ready to rephrase your question."
# }

logger.debug(f"QDRANT_URL: {QDRANT_URL}")
logger.debug(f"QDRANT_API_KEY: {QDRANT_API_KEY[:5]}****")
logger.debug(f"EMBEDDING_MODEL: {EMBEDDING_MODEL}")

# --- Dependency Injection ---
try:
    shloka_retriever = ScriptureRetriever()
    logger.info("ScriptureRetriever initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing ScriptureRetriever: {e}")
    shloka_retriever = None

# --- Constants ---
CONVERSATIONAL_KEYWORDS = ["hello", "hi", "hey", "morning", "afternoon", "evening", "how are you", "thanks", "thank you", "ok", "bye", "good", "great", "cool", "yo", "bro", "sister", "friend", "dude", "mate", "pal", "buddy", "fam", "squad", "team", "gang", "crew", "homie", "chill", "peace", "vibe", "lit", "fire", "bless", "blessed", "grateful", "appreciate", "respect", "love", "heart", "soul"]
# Update FALLBACK_RESPONSE to include new_summary
FALLBACK_RESPONSE_DATA = {
    "shloka": "",
    "meaning": "",
    "shloka_summary": "No specific scripture needed for this.",
    "response": "I understand. How else may I assist you on your path today?",
    "reflection": "Is there anything specific on your mind?",
    "emotion": "neutral",
    "new_summary": "" # Default empty summary
}


# --- Helper Functions ---
def is_conversational(query: str) -> bool:
    """Check if the query is likely simple small talk."""
    query_lower = query.lower().strip().rstrip('?.!')
    
    # Simple greeting keywords
    GREETING_KEYWORDS = ["hello", "hi", "hey", "morning", "afternoon", "evening", 
                         "how are you", "thanks", "thank you", "ok", "bye"]
    
    # Meta-conversation keywords - these should NOT be treated as simple conversational
    META_CONVERSATION_KEYWORDS = ["reframe", "explain differently", "clarify", 
                                 "simplify", "elaborate", "what do you mean", 
                                 "can you rephrase", "another way", "better explanation"]
    
    # If it's a meta-conversation request, it's NOT simple conversational
    for keyword in META_CONVERSATION_KEYWORDS:
        if keyword in query_lower:
            return False
    
    # If it's just a greeting or very short, it's conversational
    return any(keyword in query_lower for keyword in GREETING_KEYWORDS) or len(query_lower.split()) < 3

async def call_llm_service(prompt: str) -> str:
    """Calls the LLM service asynchronously."""
    async with httpx.AsyncClient(timeout=180) as client:
        try:
            logger.debug(f"Sending prompt to LLM: {prompt[:300]}...") # Log start of prompt
            response = await client.post(
                f"{LLM_SERVICE_URL}/generate",
                json={"prompt": prompt},
            )
            response.raise_for_status()
            llm_data = response.json()
            llm_output = llm_data.get("response", "Error: LLM service returned no response")
            logger.debug(f"Received response from LLM: {llm_output[:300]}...") # Log start of response
            return llm_output
        except httpx.RequestError as e:
            logger.error(f"Error calling LLM service: {e}")
            return "Error: Could not connect to LLM service."
        except httpx.HTTPStatusError as e:
            logger.error(f"LLM service returned error {e.response.status_code}: {e.response.text}")
            return f"Error: LLM service failed ({e.response.status_code})."
        except Exception as e:
            logger.error(f"Unexpected error during LLM call: {e}")
            return "Error: Unexpected error processing LLM response."

def parse_llm_response(llm_output_str: str, previous_summary: Optional[str] = None) -> LLMStructuredResponse:
    """Safely parses JSON from LLM output, ensuring LLMStructuredResponse format."""
    fallback_data = FALLBACK_RESPONSE_DATA.copy()
    fallback_data["new_summary"] = previous_summary or "" # Use previous summary as fallback

    if not llm_output_str or llm_output_str.startswith("Error"):
        logger.warning(f"LLM returned an error or empty string: {llm_output_str}")
        return LLMStructuredResponse(**fallback_data)

    try:
        # Find the JSON part (more robustly)
        match = re.search(r'\{.*\}', llm_output_str, re.DOTALL)
        if match:
            json_str = match.group(0)
            parsed = json.loads(json_str)
            # Ensure all required fields are present, including new_summary
            if all(k in parsed for k in LLMStructuredResponse.model_fields.keys()):
                 logger.info("Successfully parsed structured response from LLM.")
                 return LLMStructuredResponse(**parsed)
            else:
                 logger.warning(f"Parsed JSON missing required keys. Found: {parsed.keys()}. Required: {LLMStructuredResponse.model_fields.keys()}")
                 # Try to fill missing keys with fallback, keeping existing ones
                 merged_data = fallback_data.copy()
                 merged_data.update(parsed) # Overwrite defaults with parsed values
                 # Ensure new_summary is present
                 if "new_summary" not in merged_data or not merged_data["new_summary"]:
                     merged_data["new_summary"] = previous_summary or ""
                 return LLMStructuredResponse(**merged_data)

        else:
            logger.warning(f"Could not find JSON block in LLM output: {llm_output_str[:200]}...")
            # If no JSON, assume it's a simple response (e.g., from simple_prompt)
            # Use fallback structure but fill the 'response' field
            fallback_data["response"] = llm_output_str.strip()
            return LLMStructuredResponse(**fallback_data)

    except Exception as e:
        logger.error(f"JSON parsing failed: {e}. LLM output: {llm_output_str[:200]}...")
        # Use fallback but try to keep the raw response
        fallback_data["response"] = llm_output_str.strip()
        return LLMStructuredResponse(**fallback_data)



# --- API Endpoints ---

# def parse_llm_response(llm_output_str: str) -> dict:
#     """Safely parses JSON from LLM output with fallback strategies."""
#     if not llm_output_str or llm_output_str.startswith("Error"):
#         logger.warning("LLM returned an error or empty string.")
#         return FALLBACK_RESPONSE

#     # Step 1: Try to extract JSON block from markdown formatting or curly braces
#     match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", llm_output_str, re.DOTALL)
#     if match:
#         llm_output_str = match.group(1)
#     else:
#         start = llm_output_str.find('{')
#         end = llm_output_str.rfind('}')
#         if start != -1 and end != -1 and start < end:
#             llm_output_str = llm_output_str[start:end+1]

#     cleaned_str = llm_output_str.replace('\n', ' ').replace('\r', '').strip()

#     # Step 2: Try standard JSON parsing
#     try:
#         parsed = json.loads(cleaned_str)
#         if _valid_json(parsed):
#             return parsed
#     except Exception as e:
#         logger.warning(f"json.loads failed: {e}")

#     # Step 3: Try demjson3 which is more tolerant
#     try:
#         parsed = demjson3.decode(cleaned_str)
#         if _valid_json(parsed):
#             return parsed
#     except Exception as e:
#         logger.error(f"demjson3 failed: {e}")
#         logger.debug(f"Failed string: {llm_output_str[:500]}")

#     return FALLBACK_RESPONSE

# def _valid_json(data: dict) -> bool:
#     return all(key in data for key in ["shloka", "meaning", "shloka_summary", "response", "reflection", "emotion"])


@app.post("/ask", response_model=RAGServiceResponse)
async def ask_question(user_query: RAGServiceQuery):
    """
    Receives query, history, and previous summary. Determines if RAG is needed,
    calls LLM, generates new summary (if applicable), and returns structured response.
    """
    logger.info(f"Received query: {user_query.query}")
    logger.info(f"History Length: {len(user_query.history or [])}")
    logger.info(f"Prev. Summary: {'Yes' if user_query.previous_summary else 'No'}")

    if is_conversational(user_query.query):
        logger.info("Conversational query detected, skipping RAG.")
        simple_prompt = build_simple_prompt(
            user_query=user_query.query,
            user_type=user_query.user_type,
            history=user_query.history,
            previous_summary=user_query.previous_summary # Pass summary for context
        )
        llm_response_str = await call_llm_service(simple_prompt)

        # For conversational, use fallback structure, fill response, keep previous summary
        conversational_response_data = FALLBACK_RESPONSE_DATA.copy()
        conversational_response_data["response"] = llm_response_str.strip()
        conversational_response_data["new_summary"] = user_query.previous_summary or "" # Keep old summary

        return RAGServiceResponse(
            user_query=user_query.query,
            retrieved_shlokas=[],
            llm_response=LLMStructuredResponse(**conversational_response_data),
            context="N/A (Conversational)",
            prompt="N/A (Conversational)"
        )

    if not shloka_retriever:
         raise HTTPException(status_code=503, detail="Retriever service is not available.")

    logger.info("Performing RAG.")
    try:
        retrieved_payloads = shloka_retriever.get_relevant_shloka(
            user_query.query, 
            scripture=user_query.scripture,  # Pass the scripture preference
            top_k=1
        )
    except Exception as e:
        logger.error(f"Error retrieving shlokas: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving shlokas.")

    if not retrieved_payloads:
        logger.warning("No relevant shlokas found.")
        context_string = "No relevant shlokas found."
        final_prompt = build_prompt(
            context=context_string,
            user_query=user_query.query,
            user_type=user_query.user_type,
            history=user_query.history,
            previous_summary=user_query.previous_summary
        )
        # return RAGServiceResponse(
        #     user_query=user_query.query,
        #     retrieved_shlokas=[],
        #     llm_response=LLMStructuredResponse(
        #         shloka="",
        #         meaning="",
        #         shloka_summary="No shloka found for this query.",
        #         response="Please try asking differently",
        #         reflection="",
        #         emotion="neutral",
        #     )
        # )
    else:
        context_string = "\n\n---\n\n".join([format_shloka_for_context(p) for p in retrieved_payloads])
        final_prompt = build_prompt(context=context_string, user_query=user_query.query, user_type=user_query.user_type)

    # response = requests.post(
    #     f"{LLM_SERVICE_URL}/generate",
    #     json={"prompt": final_prompt},
    #     timeout=180,
    # ).json()
    
    llm_response_str = await call_llm_service(final_prompt)
    # Parse the response, passing previous summary for fallback use
    parsed_llm_response = parse_llm_response(llm_response_str, user_query.previous_summary)

    # Ensure retrieved_payloads is a list of RetrievedShloka models if needed downstream
    # This might require converting dicts if retriever returns dicts
    validated_shlokas = [RetrievedShloka(**p) if isinstance(p, dict) else p for p in retrieved_payloads]


    return RAGServiceResponse(
        user_query=user_query.query,
        retrieved_shlokas=validated_shlokas,
        llm_response=parsed_llm_response, # This now includes new_summary
        context=context_string,
        prompt=final_prompt
    )


    # llm_response = response.get("response", "Error: LLM service returned no response")
    # response = parse_llm_response(llm_response)
    # llm_response=response.get("response", llm_response)

    # return RAGServiceResponse(
    #     user_query=user_query.query,
    #     retrieved_shlokas=retrieved_payloads,
    #     llm_response=LLMStructuredResponse(**response),
    # )

    return RAGServiceResponse(
        user_query=user_query.query,
        retrieved_shlokas=retrieved_payloads,
        context=context_string,
        prompt=final_prompt
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

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "RAG Service", "port": RAG_SERVICE_PORT}
