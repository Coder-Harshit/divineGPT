from fastapi import FastAPI
from .schema import UserQuery
import requests
from shared.config import LLM_SERVICE_URL, RAG_SERVICE_PORT
import json

app = FastAPI()

def format_shloka(shloka: dict) -> str:
    return f"""Shloka (Sanskrit): {shloka['shloka']}
Transliteration: {shloka['transliteration']}
Meaning (English): {shloka['eng_meaning']}
"""



@app.post("/ask")
def ask_question(user_query: UserQuery):
    from .retriever import GitaRetriever
    from .rag_orchestrator import build_prompt

    # Initialize the retriever
    shloka_retriever = GitaRetriever()
    top_k_results = shloka_retriever.get_relevant_shloka(user_query=user_query.query, top_k=3)

    # # 🌟 Context
    context = "\n\n---\n\n".join([format_shloka(shloka) for shloka in top_k_results])
    #

    # FIX: Changed to .content instead of .page_content
    # context_strings = [doc.content for doc in top_k_results]
    # context = "\n\n---\n\n".join(context_strings)


    final_prompt = build_prompt(context=context, user_query=user_query.query)

    response = requests.post(
        LLM_SERVICE_URL,
        json={
            "prompt": final_prompt,
        },
    )

    if response.status_code != 200:
        return {"error": "LLM service failed", "details": response.text}

    # response_data = response.json()
    # print(response_data)
    # return {
    #     "prompt": final_prompt,
    #     "user_query": user_query.query,
    #     "generated_answer": response_data.get("response", "")
    # }
# SAFE PARSE
    try:
        llm_response = json.loads(response)
    except json.JSONDecodeError:
        llm_response = {
            "shloka_summary": "N/A",
            "interpretation": response.strip(),
            "reflection": "Please contact support if the answer feels broken.",
            "emotion": "uncertain"
        }

    # BUILD SELECTED SHLOKS METADATA
    selected_shloks = []
    for doc in top_k_results:
        meta = doc.metadata
        selected_shloks.append({
            "id": meta.get("ID"),
            "chapter": meta.get("Chapter"),
            "verse": meta.get("Verse"),
            "shloka": meta.get("Shloka"),
            "transliteration": meta.get("Transliteration"),
            "hin_meaning": meta.get("HinMeaning"),
            "eng_meaning": meta.get("EngMeaning")
        })

    return {
        "query": user_query,
        "prompt": final_prompt,
        "context": context_strings,
        "selected_shloks": selected_shloks,
        "response": llm_response
    }

@app.get("/status")
def get_status():
    return {"service": "RAG Service", "port": RAG_SERVICE_PORT, "status": "running"}

@app.get("/")
def read_root():
    return {"message": "RAG Service Running", "port": RAG_SERVICE_PORT}