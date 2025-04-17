import json
import re

import demjson3
import requests
from fastapi import FastAPI, HTTPException

import shared.config
from shared.schema import RAGServiceQuery, RAGServiceResponse
from shared.config import RAG_SERVICE_PORT
from shared.logger import get_logger
from .retriever import GitaRetriever
from .prompt_builder import build_prompt, format_shloka_for_context

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


def escape_unescaped_quotes(text: str) -> str:
    """
    Attempts to escape unescaped double quotes within JSON string values.
    This is a heuristic approach and might not be perfect.
    """
    # Use a state machine-like approach with regex scan
    escaped_text = ""
    in_string = False
    escaped = False
    for char in text:
        if char == '"' and not escaped:
            in_string = not in_string
            escaped_text += char
        elif char == '"' and escaped:
            # This is an escaped quote inside a string, keep it as is
            escaped_text += char
        elif char == '\\':
            escaped = True
            escaped_text += char
        elif in_string and char == '"':
             # Found an unescaped quote inside a string - escape it
             escaped_text += '\\"'
        else:
            escaped_text += char
            # Reset escaped flag if the character wasn't a quote
            if escaped and char != '"':
                 escaped = False
            elif char != '\\': # Ensure escaped is False if not a backslash
                 escaped = False
    return escaped_text

def parse_llm_response(llm_output_str: str) -> dict:
    """Safely parses JSON from LLM output with multiple fallback strategies."""
    if not llm_output_str or llm_output_str.startswith("Error:"):
        logger.error(f"Invalid or error LLM output received: {llm_output_str}")
        return FALLBACK_RESPONSE

    logger.info(f"Attempting to parse LLM output (first 500 chars): {llm_output_str[:500]}")
    potential_json = llm_output_str.strip()

    # 1. Extract potential JSON (markdown or {})
    match = re.search(r"```(?:json)?\s*(\{.*?})\s*```", potential_json, re.DOTALL | re.IGNORECASE)
    if match:
        logger.info("Found JSON within markdown block.")
        potential_json = match.group(1).strip()
    else:
        start_index = potential_json.find('{')
        end_index = potential_json.rfind('}')
        if start_index != -1 and end_index != -1 and start_index < end_index:
            logger.info("Found JSON boundaries using '{' and '}'.")
            potential_json = potential_json[start_index : end_index + 1]
        else:
            logger.warning("Could not find clear JSON structure markers ('{}' or markdown). Attempting parse anyway.")

    # 2. Initial Cleaning (newlines)
    cleaned_json = potential_json.replace('\n', ' ').replace('\r', '')

    # *** NEW STEP ***: Attempt to escape internal quotes
    try:
        # This regex looks for a quote that is NOT preceded by a backslash (escape char)
        # and IS followed by something other than a comma, colon, closing brace, or closing bracket
        # (meaning it's likely inside a string value). This is still heuristic.
        # It replaces such quotes with an escaped quote (\").
        # Positive lookahead `(?=...)` checks what follows without consuming it.
        # Negative lookbehind `(?<!...)` checks what precedes without consuming it.
        # We look for a quote `"` not preceded by `\` -> `(?<!\\)"`
        # And followed by something that isn't whitespace + structural char -> `(?!\s*[,:}\]])`
        # This aims to only escape quotes *inside* values.

        # Let's try a simpler, more direct replacement first: replace \" with \\" to handle already escaped ones correctly,
        # then replace remaining " that are likely internal. This is very tricky.

        # A potentially safer approach: find `": "` and the next `"` that isn't preceded by `\`.
        # All quotes between those need escaping. This requires a more complex parser state.

        # --- Let's try a targeted replacement for common cases ---
        # Replace `\"` with a temporary placeholder to protect already escaped quotes
        # placeholder = "__TEMP_ESCAPED_QUOTE__"
        # cleaned_json_escaped = cleaned_json.replace('\\"', placeholder)

        # Now, try to escape quotes that are likely inside strings.
        # This regex finds a quote preceded by a non-backslash character and followed by a non-structural character.
        # It's still imperfect.
        # cleaned_json_escaped = re.sub(r'([^:\s,{])"([^,}\]])', r'\1\\"\2', cleaned_json_escaped)

        # # --- Alternative: Simpler Regex (might over-escape) ---
        # # Escape any quote not immediately after `{` or `:` or `,` and not immediately before `:` or `,` or `}`
        # # This is broad and might hit edge cases.
        # def escape_match(m):
        #     pre_char = cleaned_json_escaped[m.start()-1:m.start()].strip()
        #     post_char = cleaned_json_escaped[m.end():m.end()+1].strip()
        #     # If the surrounding chars are not structural, escape the quote
        #     if pre_char not in '{:,' and post_char not in ':,}':
        #          # Ensure it's not already escaped
        #          if m.start() == 0 or cleaned_json_escaped[m.start()-1] != '\\':
        #               return '\\"'
        #     return '"' # Return the original quote otherwise

        # cleaned_json_escaped = re.sub(r'"', escape_match, cleaned_json_escaped)


        # --- Let's stick to the placeholder approach and a simple internal escape ---
        # Escape quotes that appear after a colon and space (start of value) but before the closing quote of the value
        # This requires iterating or more complex regex. Sticking to simpler for now.

        # Restore the placeholder
        # cleaned_json_escaped = cleaned_json_escaped.replace(placeholder, '\\"')

        # Given the complexity and risk of bad regex, let's rely on demjson3 for this specific issue for now,
        # as it's often more tolerant of such errors than the standard json library.
        # We will keep the other cleaning steps.
        logger.debug("Skipping complex quote escaping, will rely on demjson3 if standard parse fails.")
        cleaned_json_to_parse = cleaned_json # Use the version without complex quote escaping for now

    except Exception as escape_err:
        logger.error(f"Error during quote escaping attempt: {escape_err}")
        cleaned_json_to_parse = cleaned_json # Fallback to original cleaned


    # 3. Attempt standard JSON parsing (using the potentially escaped string)
    try:
        # Use cleaned_json_to_parse which might have escaped quotes
        parsed_json = json.loads(cleaned_json_to_parse)
        logger.info("Successfully parsed JSON using standard json.loads.")
        if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
             return parsed_json
        else:
             logger.warning(f"Parsed JSON missing expected keys: {parsed_json.keys()}")
             return FALLBACK_RESPONSE
    except json.JSONDecodeError as e:
        logger.warning(f"Standard json.loads failed: {e}. Attempting further cleaning.")
        # Log the string *before* aggressive cleaning for better debugging
        logger.debug(f"String before aggressive cleaning: {cleaned_json_to_parse}")

        # 4. Attempt aggressive cleaning (common structural errors)
        try:
            # Use the *original* cleaned_json here, as aggressive fixes might interfere with quote issues
            cleaned_json_aggressive = re.sub(r'(,\s*)"\s*,\s*"(\w+)"\s*:', r'\1 "\2":', cleaned_json)
            cleaned_json_aggressive = re.sub(r'("\s*:\s*".*?")\s*("[\w\s]+"\s*:)', r'\1, \2', cleaned_json_aggressive)

            logger.debug(f"String after aggressive cleaning: {cleaned_json_aggressive}")
            parsed_json = json.loads(cleaned_json_aggressive)
            logger.info("Successfully parsed JSON after aggressive cleaning.")
            if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                 return parsed_json
            else:
                 logger.warning(f"Parsed JSON (aggressive clean) missing expected keys: {parsed_json.keys()}")
                 return FALLBACK_RESPONSE
        except json.JSONDecodeError as e2:
            logger.warning(f"Aggressive cleaning + json.loads failed: {e2}. Trying to fix unterminated string.")

            # 5. Attempt to fix unterminated final string (heuristic)
            if "Unterminated string" in str(e2):
                 last_quote_colon = cleaned_json.rfind('":') # Use original cleaned string
                 last_quote_comma = cleaned_json.rfind('",')
                 last_curly_brace = cleaned_json.rfind('}')

                 if last_quote_colon != -1 and (last_quote_comma < last_quote_colon or last_quote_comma == -1) and last_curly_brace < last_quote_colon:
                      fixed_json = cleaned_json + '"}'
                      logger.debug(f"Attempting fix for unterminated string: {fixed_json}")
                      try:
                          parsed_json = json.loads(fixed_json)
                          logger.info("Successfully parsed JSON after fixing potential unterminated string.")
                          if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                              return parsed_json
                          else:
                              logger.warning(f"Parsed JSON (unterminated fix) missing expected keys: {parsed_json.keys()}")
                      except json.JSONDecodeError as e_fix:
                          logger.warning(f"Fixing unterminated string failed: {e_fix}. Trying demjson3.")

            # 6. Final attempt with demjson3 (more lenient - often handles unescaped quotes)
            try:
                # Give demjson the original cleaned string, as it has its own error tolerance
                parsed_json = demjson3.decode(cleaned_json)
                logger.info("Successfully parsed JSON using demjson3.")
                if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                     return parsed_json
                else:
                     logger.warning(f"Parsed JSON (demjson3) missing expected keys: {parsed_json.keys()}")
                     return FALLBACK_RESPONSE
            except Exception as e3:
                logger.error(f"All JSON parsing methods failed. Final error (demjson3): {e3}")
                logger.error(f"Original problematic string snippet: {llm_output_str[:500]}")
                return FALLBACK_RESPONSE

# --- API Endpoints ---

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
            llm_response="No relevant shlokas found. Please try another question.",
        )

    context_string = "\n\n---\n\n".join([format_shloka_for_context(p) for p in retrieved_payloads])
    final_prompt = build_prompt(context=context_string, user_query=user_query.query, user_type=user_query.user_type)

    response = requests.post(
        f"http://localhost:{shared.config.LLM_SERVICE_PORT}/generate",
        json={"prompt": final_prompt},
        timeout=180,
    ).json()

    llm_response = response.get("response", "Error: LLM service returned no response")
    parsed_response = parse_llm_response(llm_response)
    llm_response=parsed_response.get("response", llm_response)

    return RAGServiceResponse(
        user_query=user_query.query,
        retrieved_shlokas=retrieved_payloads,
        llm_response=response.get("response","Error: LLM service returned no response"),
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

