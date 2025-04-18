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
    temperature: Optional[float] = Field(0.7, ge=0.0, le=1.0)
    max_new_tokens: Optional[int] = Field(2048, gt=0)

class LLMServiceResponse(BaseModel):
    response: str

class RAGServiceQuery(BaseModel):
    query: str
    user_type: Optional[str] = Field("neutral", description="Type of user (e.g. genz, mature, neutral")

class LLMStructuredResponse(BaseModel):
    shloka: str = Field(..., description="Sanskrit shloka that addresses the user's concern")
    meaning: str = Field(..., description="English translation of the shloka")
    shloka_summary: str = Field(..., description="Brief explanation of how the shloka relates to the query")
    response: str = Field(..., description="~200 word Krishna-style response tailored to the user's query")
    reflection: str = Field(..., description="Follow-up thought or action step for the user")
    emotion: str = Field(..., description="Emotion inferred from the user's message (e.g., confused, hopeful)")

class RAGServiceResponse(BaseModel):
    user_query: str
    retrieved_shlokas: List[RetrievedShloka]
    llm_response: LLMStructuredResponse

class ServiceStatus(BaseModel):
    service: str
    port: Optional[int] = None
    status: str
    details: Optional[str] = None