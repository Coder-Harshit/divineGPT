from fastapi import FastAPI
from .schema import PromptRequest, PromptResponse
from .inference import generate_response
from shared.config import LLM_SERVICE_PORT
app = FastAPI(title="DivineGPT - LLM Service")

@app.post("/generate", response_model=PromptResponse)
def generate(request: PromptRequest):
    """
    Generate a response from the LLM model
    """
    response = generate_response(request.prompt)
    print(response)
    return PromptResponse(response=response)
@app.get("/")
def read_root():
    return {"message": "LLM Service Running", "port": LLM_SERVICE_PORT}
@app.get("/status")
def get_status():
    return {"service": "LLM Service", "port": LLM_SERVICE_PORT, "status": "running"}
