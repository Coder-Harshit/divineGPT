from fastapi import FastAPI
from shared.schema import LLMServiceRequest, LLMServiceResponse
from shared.config import LLM_SERVICE_PORT
from shared.logger import get_logger
from .inference import generate_response
app = FastAPI(title="DivineGPT - LLM Service")
logger = get_logger("LLM Service")

@app.post("/generate", response_model=LLMServiceResponse)
def generate(request: LLMServiceRequest):
    """
    Generate a response from the LLM model
    """
    logger.info(f"Received request: {request}")
    response = generate_response(request.prompt)
    return LLMServiceResponse(response=response)
@app.get("/")
def read_root():
    return {"message": "LLM Service Running", "port": LLM_SERVICE_PORT}
@app.get("/status")
def get_status():
    return {
        "service": "LLM Service",
        "port": LLM_SERVICE_PORT,
        "status": "running"
    }
