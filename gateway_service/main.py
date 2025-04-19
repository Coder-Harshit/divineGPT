from fastapi import FastAPI, Request, HTTPException
from shared.config import GATEWAY_SERVICE_PORT, RAG_SERVICE_PORT
from shared.schema import RAGServiceQuery, RAGServiceResponse
from shared.logger import get_logger
import httpx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DivineGPT - Gateway Service")
logger = get_logger("Gateway Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for CORS
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

RAG_SERVICE_URL = f"http://localhost:{RAG_SERVICE_PORT}"

@app.post("/ask", response_model=RAGServiceResponse)
async def gateway_ask(request: Request):
    """
    Gateway endpoint to forward requests to the RAG service.
    """
    body = await request.json()
    user_query = RAGServiceQuery(**body)

    logger.info(f"Gateway received query: {user_query.query}")

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            rag_response = await client.post(
                f"{RAG_SERVICE_URL}/ask",
                json=user_query.model_dump,
            )
            rag_response.raise_for_status()
            response_data = rag_response.json()
    except httpx.RequestError as exc:
        logger.error(f"Error connecting to RAG service: {exc}")
        raise HTTPException(status_code=503, detail="RAG service unavailable")
    except httpx.HTTPStatusError as exc:
        logger.error(f"RAG service returned error: {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)

    logger.info(f"Gateway returning response to client.")
    return response_data

@app.get("/")
async def read_root():
    """
    Root endpoint to check if the gateway_service service is running.
    """
    return {"message": "Gateway Service Running", "port": GATEWAY_SERVICE_PORT}