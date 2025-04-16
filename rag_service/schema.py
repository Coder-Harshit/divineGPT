from pydantic import BaseModel, Field
from typing import List, Optional

class RAGServiceQuery(BaseModel):
    query: str = Field(..., description="Query string")
    user_type: Optional[str] = Field("neutral", description="Type of user making the query ('mature', 'neutral', 'genz'")

class RetrievedShloka(BaseModel):
    id: str = Field(..., description="UUID for shloka")
    chapter: int = Field(..., description="Chapter number")
    verse: int = Field(..., description="Verse number")
    shloka: str = Field(..., description="Shloka text (in Sanskrit)")
    transliteration: Optional[str] = Field(None, description="Transliteration text")
    eng_meaning: Optional[str] = Field(None, description="English translation text")
    hin_meaning: Optional[str] = Field(None, description="Hindi translation text")
    word_meaning: Optional[str] = Field(None, description="Word-by-Word text meaning")

class LLMStructuredResponse(BaseModel):
    shloka: str = Field(..., description="Sanskrit shloka text relevant to the query")
    meaning: str = Field(..., description="Simple translation of the shloka")
    response: str = Field(..., description="Krishna's conversational guidance to the user")

class RAGServiceResponse(BaseModel):
    user_query: str = Field(..., description="Query string")
    retrieved_shlokas: List[RetrievedShloka] = Field(..., description="List of retrieved shlokas")
    llm_response: LLMStructuredResponse = Field(..., description="LLM structured response")

class ServiceStatus(BaseModel):
    service: str = Field(..., description="Service name")
    port: Optional[int] = Field(None, description="Service port")
    status: str = Field(..., description="Service status")
    details: Optional[str] = Field(None, description="Additional details about the service status")



#
# class UserQuery(BaseModel):
#     query: str