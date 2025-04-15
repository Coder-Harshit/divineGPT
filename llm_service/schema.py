"""
defines the schema for the request and response
"""

from pydantic import BaseModel

class PromptRequest(BaseModel):
    # add all the things here which we want to pass to the model and want user to have a decision on them
    # for example: temperature, max_new_tokens, etc.
    prompt: str
    # temperature: float

class PromptResponse(BaseModel):
    response: str