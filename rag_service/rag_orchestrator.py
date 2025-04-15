from rag_service.retriever import GitaRetriever
import requests
from shared.config import LLM_SERVICE_URL

# For now, hardcoding user_type; in future, detect it from metadata or query
USER_TYPE = "genz"  # or "mature", or "neutral"

def format_shloka(shloka: dict) -> str:
    return f"""Shloka (Sanskrit): {shloka['shloka']}
Transliteration: {shloka['transliteration']}
Meaning (English): {shloka['eng_meaning']}
"""

def build_prompt(context: str, user_query: str, user_type: str = "neutral") -> str:
    style_instructions = {
        "genz": "Use Gen Z-friendly, casual, and slightly witty language—something they'd find relatable on Instagram or Discord, but still deep.",
        "mature": "Use respectful, thoughtful, and slightly formal tone—as if guiding someone who appreciates depth and tradition.",
        "neutral": "Use a balanced tone—clear, warm, and conversational. Assume the person is just seeking clarity in life."
    }

    return f"""
👉 IMPORTANT: Your entire response must follow this JSON format only:

{{
  "shloka_summary": "<brief explanation of the shloka in context of the user's problem>",
  "interpretation": "<relatable explanation using analogies, Gen Z-friendly or mature tone as needed>",
  "reflection": "<a gentle push to reflect or take action>",
  "emotion": "<emotion the user might be feeling, like 'confused', 'anxious', 'hopeless'>"
}}

NEVER add anything outside the above JSON. Don't use markdown, don't explain the JSON. Just reply in this format. Be emotionally supportive and human in tone.
    
You are DivineGPT, an emotionally intelligent AI mentor inspired by Lord Krishna. You understand human emotions deeply, and you give advice rooted in the Bhagavad Gita and other Hindu scriptures, but in a way that’s relatable, comforting, and clear.

Here's a passage from the Gita or a related scripture that aligns with what the user might be going through:

📜 Shloka/Excerpt:
{context}

🧠 User's Question:
"{user_query}"

Your task is to do the following:
- Briefly reference the above shloka and explain what it means.
- Use storytelling, analogies, or relatable modern concepts to make it stick.
- Tailor your tone to suit this type of user: {user_type.upper()}.
- Finish with a soft but strong push to action or reflection. Something they will remember.

{style_instructions.get(user_type, style_instructions['neutral'])}

Respond like a mentor,a close person, a best friend, or even a divine guide—but never like a rigid spiritual bot.
"""

def get_answer(user_query: str):
    retriever = GitaRetriever()
    top_k_shlokas = retriever.get_relevant_shloka(user_query, top_k=3)

    # 🌟 Context for LLM: All 3 shlokas
    context_block = "\n\n".join([format_shloka(shloka) for shloka in top_k_shlokas])

    # 🧠 Final Prompt with rich context
    final_prompt = build_prompt(context_block, user_query, user_type=USER_TYPE)

    # 🎯 Only the top-1 shloka (optional: display or log separately)
    top_1_shloka = top_k_shlokas[0]

    response = requests.post(
        LLM_SERVICE_URL,
        json={'prompt': final_prompt}
    )

    return {
        "response": response.json()["response"],
        "top_shloka": format_shloka(top_1_shloka)  # Optional: you can return this to show it to the user
    }

# --- TESTING ---
if __name__ == "__main__":
    user_query = input("Ask DivineGPT your question: ")
    result = get_answer(user_query)

    print("\n📜 Top Relevant Shloka:")
    print(result["top_shloka"])
    print("\n[🕉 DivineGPT Replies:]")
    print(result["response"])
