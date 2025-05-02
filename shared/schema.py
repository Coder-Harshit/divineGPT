from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class T2SRequest(BaseModel):
    text: str
    lang: str = Field('en', description="Language code (e.g., en, hi)")

class AudioResponse(BaseModel):
    audio_url: str
    content_type: str = Field('audio/mpeg', description="Content type of the audio file")

class MessageSchema(BaseModel):
    """Represents a single message in the chat histroy."""
    role: str = Field(..., description="Role of the message sender (e.g., user, assistant)")
    content: str = Field(..., description="Content of the message")

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
    user_type: str = "neutral"
    history: Optional[List[MessageSchema]] = None
    previous_summary: Optional[str] = None
    scripture: str = "all"  # Options: "gita", "ramayana", "all"

class LLMStructuredResponse(BaseModel):
    shloka: str = Field(..., description="Sanskrit shloka that addresses the user's concern")
    meaning: str = Field(..., description="English translation of the shloka")
    shloka_summary: str = Field(..., description="Brief explanation of how the shloka relates to the query")
    response: str = Field(..., description="~200 word Krishna-style response tailored to the user's query")
    reflection: str = Field(..., description="Follow-up thought or action step for the user")
    emotion: str = Field(..., description="Emotion inferred from the user's message (e.g., confused, hopeful)")
    new_summary: str = Field(..., description="Updated summary of the conversation after the response")

# class RAGServiceResponse(BaseModel):
#     user_query: str
#     retrieved_shlokas: List[RetrievedShloka]
#     llm_response: LLMStructuredResponse

class RAGServiceResponse(BaseModel):
    user_query: str
    retrieved_shlokas: List[RetrievedShloka]
    llm_response: LLMStructuredResponse
    context: str
    prompt: str

class ServiceStatus(BaseModel):
    service: str
    port: Optional[int] = None
    status: str
    details: Optional[str] = None

class GatewayResposne(BaseModel):
    user_query: str
    retrieved_shlokas: List[RetrievedShloka]
    llm_response: LLMStructuredResponse

class AskRequest(BaseModel):
    query: str
    user_type: Optional[str] = Field("genz", description="Type of user (e.g. genz, mature, neutral")
    history: Optional[List[MessageSchema]] = Field(None, description="Conversation history with the user")
    previous_summary: Optional[str] = Field(None, description="Previous summary of the conversation")