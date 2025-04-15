import json
import requests
import re # Import regular expressions
from fastapi import FastAPI, HTTPException
from .schema import RAGServiceQuery # Assuming schema.py defines UserQuery(query: str)
from .retriever import GitaRetriever
from .rag_orchestrator import build_prompt, format_shloka_for_context
from shared.config import LLM_SERVICE_URL, RAG_SERVICE_PORT # Ensure these are correctly configured

app = FastAPI(
    title="DivineGPT - RAG Service",
    description="Provides answers based on Gita context using Retrieval-Augmented Generation.",
)

# --- Dependency Injection ---
try:
    shloka_retriever = GitaRetriever()
    print("GitaRetriever initialized successfully.")
except Exception as e:
    print(f"Error initializing GitaRetriever: {e}")
    shloka_retriever = None

# --- Helper Functions ---

def parse_llm_response(llm_output_str: str) -> dict:
    """
    Safely parses the JSON string expected from the LLM.
    It specifically looks for JSON within markdown code blocks (```json ... ```)
    or the first standalone JSON object '{...}' and attempts to parse it.

    Args:
        llm_output_str: The raw string response from the LLM service.

    Returns:
        A dictionary parsed from the first valid JSON string found,
        or an error dictionary if parsing fails.
    """
    if not llm_output_str:
        print("Error: LLM output string is empty.")
        return {
            "shloka_summary": "Error: LLM returned an empty response.",
            "interpretation": "", "reflection": "", "emotion": "error"
        }

    parsed_json = None
    error_message = "Error: No valid JSON object found in the LLM response."
    raw_found_block = "" # Store the block we tried to parse

    # 1. Prioritize finding JSON within ```json ... ``` markdown blocks
    # Use non-greedy matching .*?
    matches = re.findall(r'```json\s*(\{.*?\})\s*```', llm_output_str, re.DOTALL)
    if matches:
        raw_found_block = matches[0]
        try:
            parsed_json = json.loads(raw_found_block)
            print("Successfully parsed JSON found within ```json block.")
        except json.JSONDecodeError as e:
            error_message = f"Error decoding JSON found within ```json block: {e}"
            print(f"{error_message}. Block: {raw_found_block}")
            # Keep parsed_json as None to try the next method
    else:
        print("No ```json block found, searching for standalone JSON object.")
        # 2. If no markdown block found, try finding the first standalone JSON object '{...}'
        # Use non-greedy matching .*?
        first_match = re.search(r'(\{.*?\})', llm_output_str, re.DOTALL)
        if first_match:
            raw_found_block = first_match.group(1)
            try:
                parsed_json = json.loads(raw_found_block)
                print("Successfully parsed first standalone JSON object found.")
            except json.JSONDecodeError as e:
                error_message = f"Error decoding first standalone JSON object found: {e}"
                print(f"{error_message}. Block: {raw_found_block}")
                # Keep parsed_json as None
        else:
             print("No standalone JSON object found either.")


    # 3. Return result or error structure
    if parsed_json:
         # Optional: Validate expected keys
        expected_keys = {"shloka_summary", "interpretation", "reflection", "emotion"}
        if not expected_keys.issubset(parsed_json.keys()):
             print(f"Warning: Parsed JSON missing expected keys. Got: {parsed_json.keys()}")
        return parsed_json
    else:
        print(f"Final parsing attempt failed. Raw LLM response was: {llm_output_str}")
        return {
            "shloka_summary": error_message,
            "interpretation": f"Failed to parse. Raw block attempted: {raw_found_block}",
            "reflection": "",
            "emotion": "error"
        }


# --- API Endpoints ---

@app.post("/ask")
async def ask_question(user_query: RAGServiceQuery):
    """
    Receives a user query, retrieves relevant Gita shlokas,
    generates a prompt, gets a response from the LLM,
    and returns a structured JSON object.
    """
    if not shloka_retriever:
         raise HTTPException(status_code=503, detail="Retriever service is not available.")

    query_text = user_query.query
    print(f"Received query: {query_text}")

    # 1. Retrieve relevant shlokas
    try:
        top_k = 3
        retrieved_payloads = shloka_retriever.get_relevant_shloka(user_query=query_text, top_k=top_k)
        if not retrieved_payloads:
             print("No relevant shlokas found.")
             return {
                "user_query": query_text,
                "retrieved_shlokas": [],
                "llm_response": {
                    "shloka_summary": "No specific shlokas found for this query.",
                    "interpretation": "Could you please rephrase your question or ask something different?",
                    "reflection": "",
                    "emotion": "neutral"
                },
            }
    except Exception as e:
        print(f"Error during shloka retrieval: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve context: {e}")

    # 2. Format Context and Build Prompt
    try:
        context_string = "\n\n---\n\n".join([format_shloka_for_context(payload) for payload in retrieved_payloads])
        final_prompt = build_prompt(context=context_string, user_query=query_text)
        print(f"Generated Prompt (first 200 chars): {final_prompt[:200]}...")
    except Exception as e:
        print(f"Error building prompt: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to build prompt: {e}")

    # 3. Call LLM Service
    try:
        print(f"Sending request to LLM service at: {LLM_SERVICE_URL}")
        llm_api_response = requests.post(
            LLM_SERVICE_URL,
            json={"prompt": final_prompt},
            timeout=90
        )
        llm_api_response.raise_for_status()

    except requests.exceptions.RequestException as e:
        print(f"Error calling LLM service: {e}")
        raise HTTPException(status_code=503, detail=f"LLM service request failed: {e}")
    except Exception as e:
        print(f"Unexpected error during LLM call: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

    # 4. Parse LLM Response
    raw_llm_output = "" # Initialize
    structured_llm_response = {} # Initialize
    try:
        llm_response_data = llm_api_response.json()
        raw_llm_output = llm_response_data.get("response")

        if not raw_llm_output:
             print("Error: LLM service response payload did not contain 'response' key or it was empty.")
             structured_llm_response = {
                "shloka_summary": "Error: Received empty response content from LLM service.",
                "interpretation": "", "reflection": "", "emotion": "error"
             }
        else:
            print(f"Raw LLM Output String (first 500 chars): {raw_llm_output[:500]}...") # Log snippet
            structured_llm_response = parse_llm_response(raw_llm_output)
            print(f"Parsed LLM Response: {structured_llm_response}")

    except json.JSONDecodeError as e:
        print(f"Error decoding the main JSON response from LLM service: {e}")
        print(f"LLM Service Response Text: {llm_api_response.text}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from LLM service: {e}")
    except Exception as e:
        print(f"Unexpected error processing LLM response: {e}")
        structured_llm_response = parse_llm_response(raw_llm_output) # Attempt parse even on error


    # 5. Format Retrieved Shlokas for Output
    output_shlokas = []
    for payload in retrieved_payloads:
        output_shlokas.append({
            "id": payload.get("id", "N/A"),
            "chapter": payload.get("chapter", -1),
            "verse": payload.get("verse", -1),
            "shloka": payload.get("shloka", "N/A"),
            "transliteration": payload.get("transliteration", "N/A"),
            "eng_meaning": payload.get("eng_meaning", "N/A"),
            "hin_meaning": payload.get("hin_meaning", "N/A")
        })

    # 6. Construct Final Structured Response
    final_response = {
        "user_query": query_text,
        "retrieved_shlokas": output_shlokas,
        "llm_response": structured_llm_response,
    }

    return final_response

@app.get("/status")
async def get_status():
    retriever_status = "initialized" if shloka_retriever else "initialization_failed"
    return {
        "service": "RAG Service",
        "port": RAG_SERVICE_PORT,
        "status": "running",
        "retriever_status": retriever_status
        }

@app.get("/")
async def read_root():
    return {"message": "RAG Service Running", "port": RAG_SERVICE_PORT}

# Add other necessary imports and configurations (e.g., CORS middleware if needed)

