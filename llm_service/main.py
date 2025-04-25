from fastapi import FastAPI
from shared.schema import LLMServiceRequest, LLMServiceResponse
from shared.config import LLM_SERVICE_PORT
from shared.logger import get_logger
from .inference import generate_response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DivineGPT - LLM Service")
logger = get_logger("LLM Service")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
async def get_status():
    return {
        "service": "LLM Service",
        "port": LLM_SERVICE_PORT,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "LLM Service", "port": LLM_SERVICE_PORT}