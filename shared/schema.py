from pydantic import BaseModel, Field
from typing import List, Optional

class RetrievedShloka(BaseModel):
    id: str
    chapter: int
    verse: int
    shloka: str
    transliteration: Optional[str] = None
    eng_meaning: Optional[str] = None
    hin_meaning: Optional[str] = None

class LLMServiceRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = 0.7
    max_new_tokens: Optional[int] = 2048

class LLMServiceResponse(BaseModel):
    response: str

class RAGServiceQuery(BaseModel):
    query: str
    user_type: Optional[str] = "neutral"

class RAGServiceResponse(BaseModel):
    user_query: str
    retrieved_shlokas: List[RetrievedShloka]
    llm_response: str