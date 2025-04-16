import json
import requests
import re 
from fastapi import FastAPI, HTTPException
from .schema import RAGServiceQuery
from .retriever import GitaRetriever
from .rag_orchestrator import build_prompt, format_shloka_for_context
from shared.config import LLM_SERVICE_URL, RAG_SERVICE_PORT
import google.generativeai as genai # Import the Gemini library
import demjson3
import os
from dotenv import load_dotenv
import logging # Use logging for better diagnostics

load_dotenv(".env.local") # Load environment variables from .env file
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configure Gemini API Key (Recommended: Use environment variables)
try:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=GOOGLE_API_KEY)
    # Choose the model - gemini-1.5-flash-latest is often free and fast
    gemini_model = genai.GenerativeModel('gemini-2.0-flash-lite')
    logging.info("Gemini API configured successfully.")
except Exception as e:
    logging.error(f"Failed to configure Gemini API: {e}")
    gemini_model = None # Ensure model is None if setup fails



# Define a fallback response
FALLBACK_RESPONSE = {
    "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    "meaning": "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results, and never be attached to not doing your duty.",
    "response": "My dear friend, I sense your question is important, but there seems to be a temporary challenge in how I'm processing it. Just as the Gita teaches us about perseverance through obstacles, I encourage you to try asking again. Sometimes the divine timing requires patience. The wisdom you seek is worth the effort. I'm here ready to guide you when you're ready to rephrase your question."
}


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
#
# def parse_llm_response(llm_output_str: str) -> dict:
#     """
#     Safely parses the JSON string expected from the LLM.
#     It specifically looks for JSON within markdown code blocks (```json ... ```)
#     or the first standalone JSON object '{...}' and attempts to parse it.
#
#     Args:
#         llm_output_str: The raw string response from the LLM service.
#
#     Returns:
#         A dictionary parsed from the first valid JSON string found,
#         or an error dictionary if parsing fails.
#     """
#     if not llm_output_str:
#         print("Error: LLM output string is empty.")
#         return {
#             "shloka_summary": "Error: LLM returned an empty response.",
#             "interpretation": "", "reflection": "", "emotion": "error"
#         }
#
#     parsed_json = None
#     error_message = "Error: No valid JSON object found in the LLM response."
#     raw_found_block = "" # Store the block we tried to parse
#
#     # 1. Prioritize finding JSON within ```json ... ``` markdown blocks
#     # Use non-greedy matching .*?
#     matches = re.findall(r'```json\s*(\{.*?\})\s*```', llm_output_str, re.DOTALL)
#     if matches:
#         raw_found_block = matches[0]
#         try:
#             parsed_json = json.loads(raw_found_block)
#             print("Successfully parsed JSON found within ```json block.")
#         except json.JSONDecodeError:
#             parsed_json = demjson3.decode(raw_found_block)
#             print("Successfully parsed using demjson3 fallback.")
#         except demjson3.JSONDecodeError as e:
#             error_message = f"Error decoding JSON found within ```json block: {e}"
#             print(f"{error_message}. Block: {raw_found_block}")
#             # Keep parsed_json as None to try the next method
#     else:
#         print("No ```json block found, searching for standalone JSON object.")
#         # 2. If no markdown block found, try finding the first standalone JSON object '{...}'
#         # Use non-greedy matching .*?
#         first_match = re.search(r'(\{.*?\})', llm_output_str, re.DOTALL)
#         if first_match:
#             raw_found_block = first_match.group(1)
#             # try:
#             #     parsed_json = json.loads(raw_found_block)
#             #     print("Successfully parsed first standalone JSON object found.")
#             # except json.JSONDecodeError as e:
#             #     error_message = f"Error decoding first standalone JSON object found: {e}"
#             #     print(f"{error_message}. Block: {raw_found_block}")
#                 # Keep parsed_json as None
#             try:
#                 parsed_json = json.loads(raw_found_block)
#                 print("Successfully parsed JSON found within ```json block.")
#             except json.JSONDecodeError:
#                 parsed_json = demjson3.decode(raw_found_block)
#                 print("Successfully parsed using demjson3 fallback.")
#             except demjson3.JSONDecodeError as e:
#                 error_message = f"Error decoding JSON found within ```json block: {e}"
#                 print(f"{error_message}. Block: {raw_found_block}")
#         else:
#              print("No standalone JSON object found either.")
#
#
#     # 3. Return result or error structure
#     if parsed_json:
#          # Optional: Validate expected keys
#         expected_keys = {"shloka_summary", "interpretation", "reflection", "emotion"}
#         if not expected_keys.issubset(parsed_json.keys()):
#              print(f"Warning: Parsed JSON missing expected keys. Got: {parsed_json.keys()}")
#         return parsed_json
#     else:
#         print(f"Final parsing attempt failed. Raw LLM response was: {llm_output_str}")
#         return {
#             "shloka_summary": error_message,
#             "interpretation": f"Failed to parse. Raw block attempted: {raw_found_block}",
#             "reflection": "",
#             "emotion": "error"
#         }
#

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
        logging.error(f"Invalid or error LLM output received: {llm_output_str}")
        return FALLBACK_RESPONSE

    logging.info(f"Attempting to parse LLM output (first 500 chars): {llm_output_str[:500]}")
    potential_json = llm_output_str.strip()

    # 1. Extract potential JSON (markdown or {})
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", potential_json, re.DOTALL | re.IGNORECASE)
    if match:
        logging.info("Found JSON within markdown block.")
        potential_json = match.group(1).strip()
    else:
        start_index = potential_json.find('{')
        end_index = potential_json.rfind('}')
        if start_index != -1 and end_index != -1 and start_index < end_index:
            logging.info("Found JSON boundaries using '{' and '}'.")
            potential_json = potential_json[start_index : end_index + 1]
        else:
            logging.warning("Could not find clear JSON structure markers ('{}' or markdown). Attempting parse anyway.")

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
        placeholder = "__TEMP_ESCAPED_QUOTE__"
        cleaned_json_escaped = cleaned_json.replace('\\"', placeholder)

        # Now, try to escape quotes that are likely inside strings.
        # This regex finds a quote preceded by a non-backslash character and followed by a non-structural character.
        # It's still imperfect.
        # cleaned_json_escaped = re.sub(r'([^:\s,{])"([^,}\]])', r'\1\\"\2', cleaned_json_escaped)

        # --- Alternative: Simpler Regex (might over-escape) ---
        # Escape any quote not immediately after `{` or `:` or `,` and not immediately before `:` or `,` or `}`
        # This is broad and might hit edge cases.
        def escape_match(m):
            pre_char = cleaned_json_escaped[m.start()-1:m.start()].strip()
            post_char = cleaned_json_escaped[m.end():m.end()+1].strip()
            # If the surrounding chars are not structural, escape the quote
            if pre_char not in '{:,' and post_char not in ':,}':
                 # Ensure it's not already escaped
                 if m.start() == 0 or cleaned_json_escaped[m.start()-1] != '\\':
                      return '\\"'
            return '"' # Return the original quote otherwise

        # cleaned_json_escaped = re.sub(r'"', escape_match, cleaned_json_escaped)


        # --- Let's stick to the placeholder approach and a simple internal escape ---
        # Escape quotes that appear after a colon and space (start of value) but before the closing quote of the value
        # This requires iterating or more complex regex. Sticking to simpler for now.

        # Restore the placeholder
        # cleaned_json_escaped = cleaned_json_escaped.replace(placeholder, '\\"')

        # Given the complexity and risk of bad regex, let's rely on demjson3 for this specific issue for now,
        # as it's often more tolerant of such errors than the standard json library.
        # We will keep the other cleaning steps.
        logging.debug("Skipping complex quote escaping, will rely on demjson3 if standard parse fails.")
        cleaned_json_to_parse = cleaned_json # Use the version without complex quote escaping for now

    except Exception as escape_err:
        logging.error(f"Error during quote escaping attempt: {escape_err}")
        cleaned_json_to_parse = cleaned_json # Fallback to original cleaned


    # 3. Attempt standard JSON parsing (using the potentially escaped string)
    try:
        # Use cleaned_json_to_parse which might have escaped quotes
        parsed_json = json.loads(cleaned_json_to_parse)
        logging.info("Successfully parsed JSON using standard json.loads.")
        if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
             return parsed_json
        else:
             logging.warning(f"Parsed JSON missing expected keys: {parsed_json.keys()}")
             return FALLBACK_RESPONSE
    except json.JSONDecodeError as e:
        logging.warning(f"Standard json.loads failed: {e}. Attempting further cleaning.")
        # Log the string *before* aggressive cleaning for better debugging
        logging.debug(f"String before aggressive cleaning: {cleaned_json_to_parse}")

        # 4. Attempt aggressive cleaning (common structural errors)
        try:
            # Use the *original* cleaned_json here, as aggressive fixes might interfere with quote issues
            cleaned_json_aggressive = re.sub(r'(,\s*)"\s*,\s*"(\w+)"\s*:', r'\1 "\2":', cleaned_json)
            cleaned_json_aggressive = re.sub(r'("\s*:\s*".*?")\s*("[\w\s]+"\s*:)', r'\1, \2', cleaned_json_aggressive)

            logging.debug(f"String after aggressive cleaning: {cleaned_json_aggressive}")
            parsed_json = json.loads(cleaned_json_aggressive)
            logging.info("Successfully parsed JSON after aggressive cleaning.")
            if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                 return parsed_json
            else:
                 logging.warning(f"Parsed JSON (aggressive clean) missing expected keys: {parsed_json.keys()}")
                 return FALLBACK_RESPONSE
        except json.JSONDecodeError as e2:
            logging.warning(f"Aggressive cleaning + json.loads failed: {e2}. Trying to fix unterminated string.")

            # 5. Attempt to fix unterminated final string (heuristic)
            if "Unterminated string" in str(e2):
                 last_quote_colon = cleaned_json.rfind('":') # Use original cleaned string
                 last_quote_comma = cleaned_json.rfind('",')
                 last_curly_brace = cleaned_json.rfind('}')

                 if last_quote_colon != -1 and (last_quote_comma < last_quote_colon or last_quote_comma == -1) and last_curly_brace < last_quote_colon:
                      fixed_json = cleaned_json + '"}'
                      logging.debug(f"Attempting fix for unterminated string: {fixed_json}")
                      try:
                          parsed_json = json.loads(fixed_json)
                          logging.info("Successfully parsed JSON after fixing potential unterminated string.")
                          if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                              return parsed_json
                          else:
                              logging.warning(f"Parsed JSON (unterminated fix) missing expected keys: {parsed_json.keys()}")
                      except json.JSONDecodeError as e_fix:
                          logging.warning(f"Fixing unterminated string failed: {e_fix}. Trying demjson3.")

            # 6. Final attempt with demjson3 (more lenient - often handles unescaped quotes)
            try:
                # Give demjson the original cleaned string, as it has its own error tolerance
                parsed_json = demjson3.decode(cleaned_json)
                logging.info("Successfully parsed JSON using demjson3.")
                if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
                     return parsed_json
                else:
                     logging.warning(f"Parsed JSON (demjson3) missing expected keys: {parsed_json.keys()}")
                     return FALLBACK_RESPONSE
            except Exception as e3:
                logging.error(f"All JSON parsing methods failed. Final error (demjson3): {e3}")
                logging.error(f"Original problematic string snippet: {llm_output_str[:500]}")
                return FALLBACK_RESPONSE


# def parse_llm_response(llm_output_str: str) -> dict:
#     """Safely parses JSON from LLM output with multiple fallback strategies."""
#     if not llm_output_str or llm_output_str.startswith("Error:"):
#         logging.error(f"Invalid or error LLM output received: {llm_output_str}")
#         return FALLBACK_RESPONSE

#     logging.info(f"Attempting to parse LLM output (first 500 chars): {llm_output_str[:500]}")
#     potential_json = llm_output_str.strip()

#     # 1. Extract potential JSON (markdown or {})
#     match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", potential_json, re.DOTALL | re.IGNORECASE)
#     if match:
#         logging.info("Found JSON within markdown block.")
#         potential_json = match.group(1).strip()
#     else:
#         start_index = potential_json.find('{')
#         end_index = potential_json.rfind('}')
#         if start_index != -1 and end_index != -1 and start_index < end_index:
#             logging.info("Found JSON boundaries using '{' and '}'.")
#             potential_json = potential_json[start_index : end_index + 1]
#         else:
#             logging.warning("Could not find clear JSON structure markers ('{}' or markdown). Attempting parse anyway.")

#     # 2. Initial Cleaning
#     cleaned_json = potential_json.replace('\n', ' ').replace('\r', '')

#     # 3. Attempt standard JSON parsing
#     try:
#         parsed_json = json.loads(cleaned_json)
#         logging.info("Successfully parsed JSON using standard json.loads.")
#         if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#              return parsed_json
#         else:
#              logging.warning(f"Parsed JSON missing expected keys: {parsed_json.keys()}")
#              return FALLBACK_RESPONSE
#     except json.JSONDecodeError as e:
#         logging.warning(f"Standard json.loads failed: {e}. Attempting further cleaning.")
#         logging.debug(f"String before further cleaning: {cleaned_json}")

#         # 4. Attempt aggressive cleaning (common errors)
#         try:
#             cleaned_json_aggressive = re.sub(r'(,\s*)"\s*,\s*"(\w+)"\s*:', r'\1 "\2":', cleaned_json)
#             cleaned_json_aggressive = re.sub(r'("\s*:\s*".*?")\s*("[\w\s]+"\s*:)', r'\1, \2', cleaned_json_aggressive)
#             # Add other fixes here if needed

#             logging.debug(f"String after aggressive cleaning: {cleaned_json_aggressive}")
#             parsed_json = json.loads(cleaned_json_aggressive)
#             logging.info("Successfully parsed JSON after aggressive cleaning.")
#             if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#                  return parsed_json
#             else:
#                  logging.warning(f"Parsed JSON (aggressive clean) missing expected keys: {parsed_json.keys()}")
#                  return FALLBACK_RESPONSE
#         except json.JSONDecodeError as e2:
#             logging.warning(f"Aggressive cleaning + json.loads failed: {e2}. Trying to fix unterminated string.")

#             # 5. Attempt to fix unterminated final string (heuristic)
#             # Check if the error is 'Unterminated string' and the string looks like it ends mid-value
#             if "Unterminated string" in str(e2):
#                  # Find the last opening quote for a value that wasn't closed
#                  last_quote_colon = cleaned_json.rfind('":')
#                  last_quote_comma = cleaned_json.rfind('",') # Check if it was closed before potential truncation
#                  last_curly_brace = cleaned_json.rfind('}')

#                  if last_quote_colon != -1 and (last_quote_comma < last_quote_colon or last_quote_comma == -1) and last_curly_brace < last_quote_colon:
#                       # It looks like the string after the last '":' was not closed.
#                       # Append a closing quote and a closing curly brace.
#                       fixed_json = cleaned_json + '"}'
#                       logging.debug(f"Attempting fix for unterminated string: {fixed_json}")
#                       try:
#                           parsed_json = json.loads(fixed_json)
#                           logging.info("Successfully parsed JSON after fixing potential unterminated string.")
#                           if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#                               return parsed_json
#                           else:
#                               logging.warning(f"Parsed JSON (unterminated fix) missing expected keys: {parsed_json.keys()}")
#                               # Fall through to demjson3 if keys are missing
#                       except json.JSONDecodeError as e_fix:
#                           logging.warning(f"Fixing unterminated string failed: {e_fix}. Trying demjson3.")
#                           # Fall through to demjson3

#             # 6. Final attempt with demjson3 (more lenient)
#             try:
#                 # Use the original cleaned_json for demjson, as aggressive fixes might break it
#                 parsed_json = demjson3.decode(cleaned_json)
#                 logging.info("Successfully parsed JSON using demjson3.")
#                 if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#                      return parsed_json
#                 else:
#                      logging.warning(f"Parsed JSON (demjson3) missing expected keys: {parsed_json.keys()}")
#                      return FALLBACK_RESPONSE
#             except Exception as e3: # demjson might raise various errors
#                 logging.error(f"All JSON parsing methods failed. Final error (demjson3): {e3}")
#                 logging.error(f"Original problematic string snippet: {llm_output_str[:500]}")
#                 return FALLBACK_RESPONSE


# def parse_llm_response(llm_output_str: str) -> dict:
#     """Safely parses JSON from LLM output with multiple fallback strategies."""
    
#     if not llm_output_str or llm_output_str.startswith("Error:"):
#         logging.error(f"Invalid or error LLM output received: {llm_output_str}")
#         return FALLBACK_RESPONSE
    

#     logging.info(f"Attempting to parse LLM output (first 500 chars): {llm_output_str[:500]}")
#     potential_json = llm_output_str.strip()


#     # 1. Check for markdown code blocks first
#     match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", potential_json, re.DOTALL | re.IGNORECASE)
#     if match:
#         logging.info("Found JSON within markdown block.")
#         potential_json = match.group(1).strip()
#     else:
#         # 2. If no markdown, find the first '{' and last '}'
#         start_index = potential_json.find('{')
#         end_index = potential_json.rfind('}')
#         if start_index != -1 and end_index != -1 and start_index < end_index:
#             logging.info("Found JSON boundaries using '{' and '}'.")
#             potential_json = potential_json[start_index : end_index + 1]
#         else:
#             logging.warning("Could not find clear JSON structure markers ('{}' or markdown). Attempting parse anyway.")

#     # 3. Initial Cleaning (newlines mainly affect readability here, but can sometimes break lazy parsers)
#     cleaned_json = potential_json.replace('\n', ' ').replace('\r', '')

#     # 4. Attempt standard JSON parsing
#     try:
#         parsed_json = json.loads(cleaned_json)
#         logging.info("Successfully parsed JSON using standard json.loads.")
#         # Basic validation
#         if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#              return parsed_json
#         else:
#              logging.warning(f"Parsed JSON missing expected keys: {parsed_json.keys()}")
#              # Decide if you want to return partial data or fallback
#              # return parsed_json # Option: return partial data
#              return FALLBACK_RESPONSE # Option: fallback if keys missing
#     except json.JSONDecodeError as e:
#         logging.warning(f"Standard json.loads failed: {e}. Attempting further cleaning.")
#         logging.debug(f"String before further cleaning: {cleaned_json}")

#         # 5. Attempt more aggressive cleaning for common LLM errors
#         try:
#             # Fix extra comma before key: `", "key":` -> `", "key":` (Corrects the specific error log)
#             # This regex looks for a comma, optional whitespace, a quote, comma, whitespace, quote, key name, quote, colon
#             cleaned_json_aggressive = re.sub(r'(,\s*)"\s*,\s*"(\w+)"\s*:', r'\1 "\2":', cleaned_json)

#             # Fix missing comma between string value and next key: `"value" "key":` -> `"value", "key":`
#             cleaned_json_aggressive = re.sub(r'("\s*:\s*".*?")\s*("[\w\s]+"\s*:)', r'\1, \2', cleaned_json_aggressive)

#             # Add other common fixes if needed, e.g., trailing commas (use with caution)
#             # cleaned_json_aggressive = re.sub(r",\s*([}\]])", r"\1", cleaned_json_aggressive)

#             logging.debug(f"String after aggressive cleaning: {cleaned_json_aggressive}")
#             parsed_json = json.loads(cleaned_json_aggressive)
#             logging.info("Successfully parsed JSON after aggressive cleaning.")
#             if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#                  return parsed_json
#             else:
#                  logging.warning(f"Parsed JSON (aggressive clean) missing expected keys: {parsed_json.keys()}")
#                  return FALLBACK_RESPONSE
#         except json.JSONDecodeError as e2:
#             logging.warning(f"Aggressive cleaning + json.loads failed: {e2}. Trying demjson3.")

#             # 6. Final attempt with demjson3 (more lenient)
#             try:
#                 # Use the original cleaned_json before aggressive fixes for demjson
#                 parsed_json = demjson3.decode(cleaned_json)
#                 logging.info("Successfully parsed JSON using demjson3.")
#                 if "shloka" in parsed_json and "meaning" in parsed_json and "response" in parsed_json:
#                      return parsed_json
#                 else:
#                      logging.warning(f"Parsed JSON (demjson3) missing expected keys: {parsed_json.keys()}")
#                      return FALLBACK_RESPONSE
#             except Exception as e3: # demjson might raise various errors
#                 logging.error(f"All JSON parsing methods failed. Final error (demjson3): {e3}")
#                 logging.error(f"Original problematic string snippet: {llm_output_str[:500]}")
#                 return FALLBACK_RESPONSE

#     # # First attempt: Clean the string and try direct JSON parsing
#     # clean_output = llm_output_str.strip()
#     # try:
#     #     # Replace newlines with spaces
#     #     clean_output = clean_output.replace('\n', ' ')

#     #     # Add missing commas between key-value pairs
#     #     clean_output = re.sub(r'"\s*:\s*"(.*?)"\s*([a-zA-Z0-9_]+)":', r'": "\1", "\2":', clean_output)

#     #     # Ensure proper double quotes for keys and values
#     #     clean_output = re.sub(r"(\w+)'", r'"\1"', clean_output)
#     #     clean_output = re.sub(r"'(\w+)", r'"\1"', clean_output)

#     #     # Try to find content between first { and last }
#     #     if '{' in clean_output and '}' in clean_output:
#     #         start_idx = clean_output.find('{')
#     #         end_idx = clean_output.rfind('}') + 1
#     #         json_str = clean_output[start_idx:end_idx]

#     #         parsed_json = json.loads(json_str)
#     #         print("Successfully parsed JSON using direct method")
#     #         return parsed_json
#     # except json.JSONDecodeError:
#     #     print("Direct JSON parsing failed, trying alternate methods")

#     # # Second attempt: Look for JSON in markdown code blocks
#     # try:
#     #     matches = re.findall(r'```(?:json)?\s*(\{.*?\})\s*```', clean_output, re.DOTALL)
#     #     if matches:
#     #         parsed_json = json.loads(matches[0])
#     #         print("Successfully parsed JSON from markdown code block")
#     #         return parsed_json
#     # except (json.JSONDecodeError, IndexError):
#     #     print("Markdown code block parsing failed")

#     # # Third attempt: Use demjson3 for more lenient parsing
#     # try:
#     #     if '{' in clean_output and '}' in clean_output:
#     #         start_idx = clean_output.find('{')
#     #         end_idx = clean_output.rfind('}') + 1
#     #         json_str = clean_output[start_idx:end_idx]
#     #         parsed_json = demjson3.decode(json_str)
#     #         print("Successfully parsed JSON using demjson3")
#     #         return parsed_json
#     # except Exception as e:
#     #     print(f"All JSON parsing methods failed: {e}")

#     # # Fallback error response with lengthy, conversational message
#     # return {
#     #     "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
#     #     "meaning": "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results, and never be attached to not doing your duty.",
#     #     "response": "My dear friend, I sense your question is important, but there seems to be a temporary challenge in how I'm processing it. Just as the Gita teaches us about perseverance through obstacles, I encourage you to try asking again. Sometimes the divine timing requires patience. The wisdom you seek is worth the effort, just as Arjuna needed to ask his questions multiple ways before finding clarity. Your spiritual journey matters to me, and I'm here ready to guide you with the timeless wisdom of the Gita when you're ready to rephrase your question. Remember, the path to understanding often includes moments of confusion before clarity dawns. I'm here with you through both. Would you like to try asking in a different way? I'm eager to share the guidance that will serve your highest good."
#     # }


# --- API Endpoints ---

@app.post("/ask")
async def ask_question(user_query: RAGServiceQuery):
    """
    Receives a user query, retrieves relevant Gita shlokas,
    generates a prompt, gets a response from the LLM,
    and returns a structured JSON object.
    """
    if not gemini_model:
         raise HTTPException(status_code=503, detail="LLM service (Gemini API) is not configured.")

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
        logging.info(f"Sending request to LLM service at: {LLM_SERVICE_URL}")
        
        # llm_api_response = requests.post(
        #     LLM_SERVICE_URL,
        #     json={"prompt": final_prompt},
        #     timeout=180
        # )
        llm_api_response = gemini_model.generate_content(
            final_prompt,
        )
        # Extract the text - handle potential blocks or errors
        if llm_api_response.parts:
             raw_llm_output = llm_api_response.text # .text joins parts automatically
        elif llm_api_response.prompt_feedback.block_reason:
             block_reason = llm_api_response.prompt_feedback.block_reason
             logging.error(f"Gemini API call blocked. Reason: {block_reason}")
             raw_llm_output = f"Error: Content blocked by API safety filters ({block_reason})."
        else:
             logging.error("Gemini API returned an empty response.")
             raw_llm_output = "Error: LLM service returned an empty response."

        # llm_api_response.raise_for_status()

    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling LLM service: {e}")
        raise HTTPException(status_code=503, detail=f"LLM service request failed: {e}")
    except Exception as e:
        logging.error(f"Unexpected error during LLM call: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

    # 4. Parse LLM Response
    # raw_llm_output = "" # Initialize
    structured_llm_response = {} # Initialize
    try:
        # Check if the response content type is JSON before trying to decode
        content_type = llm_api_response.headers.get("Content-Type", "")
        if "application/json" in content_type:
            llm_response_data = llm_api_response.json()
            raw_llm_output = llm_response_data.get("response") # Assuming LLM service returns {"response": "..."}
        else:
            # If not JSON, assume the body is the raw text (as modified in inference.py)
            raw_llm_output = llm_api_response.text

        if not raw_llm_output:
             logging.error("Error: LLM service response was empty.")
             structured_llm_response = FALLBACK_RESPONSE # Use fallback
        elif raw_llm_output.startswith("Error:"):
             logging.error(f"LLM service returned an error: {raw_llm_output}")
             structured_llm_response = FALLBACK_RESPONSE # Use fallback
        else:
            # Call the enhanced parsing function
            structured_llm_response = parse_llm_response(raw_llm_output)
            logging.info(f"Parsed LLM Response: {structured_llm_response}") # Log the final parsed result

    except json.JSONDecodeError as e:
        # This might happen if the LLM service wrapper itself sends bad JSON
        logging.error(f"Error decoding the main JSON wrapper from LLM service: {e}")
        logging.error(f"LLM Service Response Text: {llm_api_response.text}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON wrapper from LLM service: {e}")
    except Exception as e:
        logging.error(f"Unexpected error processing LLM response: {e}")
        # Attempt to parse even if there was an error getting the text, might be redundant
        structured_llm_response = parse_llm_response(raw_llm_output if raw_llm_output else "")

    #     llm_response_data = llm_api_response.json()
    #     raw_llm_output = llm_response_data.get("response")

    #     if not raw_llm_output:
    #          print("Error: LLM service response payload did not contain 'response' key or it was empty.")
    #          structured_llm_response = {
    #             "shloka_summary": "Error: Received empty response content from LLM service.",
    #             "interpretation": "", "reflection": "", "emotion": "error"
    #          }
    #     else:
    #         print(f"Raw LLM Output String (first 500 chars): {raw_llm_output[:500]}...") # Log snippet
    #         structured_llm_response = parse_llm_response(raw_llm_output)
    #         print(f"Parsed LLM Response: {structured_llm_response}")

    # except json.JSONDecodeError as e:
    #     print(f"Error decoding the main JSON response from LLM service: {e}")
    #     print(f"LLM Service Response Text: {llm_api_response.text}")
    #     raise HTTPException(status_code=500, detail=f"Invalid JSON response from LLM service: {e}")
    # except Exception as e:
    #     print(f"Unexpected error processing LLM response: {e}")
    #     structured_llm_response = parse_llm_response(raw_llm_output) # Attempt parse even on error


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

@app.get("/debug-prompt")
async def debug_prompt(query: str):
    retrieved_payloads = shloka_retriever.get_relevant_shloka(user_query=query, top_k=3)
    context_string = "\n\n---\n\n".join([format_shloka_for_context(p) for p in retrieved_payloads])
    final_prompt = build_prompt(context=context_string, user_query=query)
    return {"final_prompt": final_prompt}




# Add other necessary imports and configurations (e.g., CORS middleware if needed)

