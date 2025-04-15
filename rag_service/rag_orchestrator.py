"""
Handles building the prompt for the LLM based on retrieved context and user query.
"""

# For now, hardcoding user_type; in future, detect it from metadata or query
# Consider passing this as a parameter or detecting it dynamically.
DEFAULT_USER_TYPE = "genz"  # or "mature", or "neutral"

def format_shloka_for_context(shloka_payload: dict) -> str:
    """
    Formats a single shloka's payload dictionary into a string for LLM context.

    Args:
        shloka_payload: A dictionary containing shloka details (e.g., from Qdrant payload).
                        Expected keys: 'shloka', 'transliteration', 'eng_meaning'.

    Returns:
        A formatted string representing the shloka.
    """
    # Safely access keys, providing default values if missing
    sanskrit = shloka_payload.get('shloka', 'N/A')
    transliteration = shloka_payload.get('transliteration', 'N/A')
    meaning = shloka_payload.get('eng_meaning', 'N/A')

    return f"""Shloka (Sanskrit): {sanskrit}
Transliteration: {transliteration}
Meaning (English): {meaning}"""

def build_prompt(context: str, user_query: str, user_type: str = DEFAULT_USER_TYPE) -> str:
    """
    Constructs the final prompt to be sent to the LLM.

    Args:
        context: A string containing the formatted relevant shlokas.
        user_query: The original query from the user.
        user_type: The target audience type ('genz', 'mature', 'neutral') for tone adjustment.

    Returns:
        The complete prompt string for the LLM.
    """
    style_instructions = {
        "genz": "Use Gen Z-friendly, casual, and slightly witty language—something they'd find relatable on Instagram or Discord, but still deep.",
        "mature": "Use respectful, thoughtful, and slightly formal tone—as if guiding someone who appreciates depth and tradition.",
        "neutral": "Use a balanced tone—clear, warm, and conversational. Assume the person is just seeking clarity in life."
    }

    # Ensure the user_type is valid, otherwise default to neutral
    if user_type not in style_instructions:
        user_type = "neutral"

    # The core instruction asking the LLM to format its response as JSON
    # IMPORTANT: Ensure the LLM you use is capable of reliably following JSON format instructions.
    return f"""
👉 IMPORTANT: Your entire response MUST be a single JSON object following this exact structure. Do NOT add any text before or after the JSON object. Do NOT use markdown formatting within the JSON values.

{{
  "shloka_summary": "<string: brief explanation of the shloka(s) in context of the user's problem>",
  "interpretation": "<string: relatable explanation using analogies, tailored to the user type>",
  "reflection": "<string: a gentle push to reflect or take action>",
  "emotion": "<string: inferred emotion of the user, e.g., 'confused', 'anxious', 'hopeful'>"
}}

---
SYSTEM INSTRUCTIONS:
You are DivineGPT, an emotionally intelligent AI mentor inspired by Lord Krishna. Your goal is to provide guidance rooted in the Bhagavad Gita using the provided context, tailored to the user's needs and emotional state.

CONTEXT:
Here are relevant passages from the Gita:
{context}

USER'S QUESTION:
"{user_query}"

TASK:
1. Analyze the user's question and the provided Gita passages (context).
2. Generate a response in the specified JSON format ONLY.
3. Inside the JSON:
    - `shloka_summary`: Briefly explain how the core message of the provided shloka(s) relates to the user's query.
    - `interpretation`: Offer a deeper, relatable interpretation. Use analogies and tailor the tone based on the user type: {user_type.upper()}. ({style_instructions[user_type]})
    - `reflection`: Provide a thoughtful question or suggestion for the user to reflect upon or act on.
    - `emotion`: Infer the primary emotion conveyed in the user's query.
4. Be empathetic, supportive, and wise, like a compassionate mentor. Avoid sounding like a generic chatbot.
---
Respond now with ONLY the JSON object:
"""

# Note: The testing block (`if __name__ == "__main__":`) that previously called
# the retriever and LLM service has been removed from this file as the
# orchestration logic now resides in the FastAPI endpoint (`rag_service/main.py`).
# You can create a separate test script if needed.
