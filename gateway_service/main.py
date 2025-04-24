import json
import random
from fastapi import FastAPI, Request, HTTPException, Response
from shared.config import RAG_SERVICE_URL, T2S_SERVICE_URL, LLM_SERVICE_URL, GATEWAY_SERVICE_PORT
from shared.schema import GatewayResposne, RAGServiceQuery, RAGServiceResponse, ServiceStatus, AudioResponse, LLMServiceResponse, LLMServiceRequest, T2SRequest
from shared.logger import get_logger
import httpx
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from fastapi.responses import JSONResponse
from circuitbreaker import circuit
import demjson3
import re


app = FastAPI(title="DivineGPT - Gateway Service")
logger = get_logger("Gateway Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for CORS
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)



# Define a fallback response
FALLBACK_RESPONSE = {
    "shloka": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    "meaning": "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results, and never be attached to not doing your duty.",
    "response": "My dear friend, I sense your question is important, but there seems to be a temporary challenge in how I'm processing it. Just as the Gita teaches us about perseverance through obstacles, I encourage you to try asking again. Sometimes the divine timing requires patience. The wisdom you seek is worth the effort. I'm here ready to guide you when you're ready to rephrase your question."
}

def parse_llm_response(llm_output_str: str) -> dict:
    """Safely parses JSON from LLM output with fallback strategies."""
    if not llm_output_str or llm_output_str.startswith("Error"):
        logger.warning("LLM returned an error or empty string.")
        return FALLBACK_RESPONSE

    # Step 1: Try to extract JSON block from markdown formatting or curly braces
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", llm_output_str, re.DOTALL)
    if match:
        llm_output_str = match.group(1)
    else:
        start = llm_output_str.find('{')
        end = llm_output_str.rfind('}')
        if start != -1 and end != -1 and start < end:
            llm_output_str = llm_output_str[start:end+1]

    cleaned_str = llm_output_str.replace('\n', ' ').replace('\r', '').strip()

    # Step 2: Try standard JSON parsing
    try:
        parsed = json.loads(cleaned_str)
        if _valid_json(parsed):
            return parsed
    except Exception as e:
        logger.warning(f"json.loads failed: {e}")

    # Step 3: Try demjson3 which is more tolerant
    try:
        parsed = demjson3.decode(cleaned_str)
        if _valid_json(parsed):
            return parsed
    except Exception as e:
        logger.error(f"demjson3 failed: {e}")
        logger.debug(f"Failed string: {llm_output_str[:500]}")

    return FALLBACK_RESPONSE

def _valid_json(data: dict) -> bool:
    return all(key in data for key in ["shloka", "meaning", "shloka_summary", "response", "reflection", "emotion"])



@app.post("/ask", response_model=GatewayResposne)
async def gateway_ask(request: Request):
    """
    Gateway endpoint to forward requests to the RAG service.
    """
    body = await request.json()
    user_query = RAGServiceQuery(**body)

    logger.info(f"Gateway received query: {user_query.query}")

    try:
        async with httpx.AsyncClient(timeout=270) as client:
            rag_response = await client.post(
                f"{RAG_SERVICE_URL}/ask",
                json=user_query.model_dump(),
                timeout=270,
            )
            rag_response.raise_for_status()
            rag_data = rag_response.json()

     
        # Check if RAG service returned a complete response (fallback case)
        if "llm_response" in rag_data:
            logger.info("RAG service returned complete response (fallback case)")
            return rag_data
            
        # Step 2: Forward prompt to LLM service
        async with httpx.AsyncClient(timeout=180) as client:
            llm_response = await client.post(
                f"{LLM_SERVICE_URL}/generate",
                json={"prompt": rag_data["prompt"]},
                timeout=180,
            )
            llm_response.raise_for_status()
            llm_data = llm_response.json()
            
        # Step 3: Parse LLM response (this was in RAG service before)
        llm_output = llm_data.get("response", "Error: LLM service returned no response")
        parsed_response = parse_llm_response(llm_output)  # You'll need to move this function to the gateway
        
        # Step 4: Construct final response
        final_response = {
            "user_query": user_query.query,
            "retrieved_shlokas": rag_data["retrieved_shlokas"],
            "llm_response": parsed_response
        }
        
        logger.info("Gateway returning complete response to client")
        print(final_response)
        return final_response
                
    except httpx.RequestError as exc:
        logger.error(f"Error connecting to RAG service: {exc}")
        raise HTTPException(status_code=503, detail="RAG service unavailable")
    except httpx.HTTPStatusError as exc:
        logger.error(f"RAG service returned error: {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)

    # logger.info(f"Gateway returning response to client.")
    # return response_data


@app.post("/speak", response_model=AudioResponse)
async def gateway_speak(request: T2SRequest):
    """
    Gateway endpoint for text-to-speech conversion
    """
    logger.info(f"Gateway received T2S request")
    
    try:
        async with httpx.AsyncClient() as client:
            t2s_response = await client.post(
                f"{T2S_SERVICE_URL}/speak",
                json=request.model_dump(),
            )
            t2s_response.raise_for_status()
            return t2s_response.json()
    except httpx.RequestError as exc:
        logger.error(f"T2S service connection error: {exc}")
        raise HTTPException(status_code=503, detail="Text-to-speech service unavailable")


# @app.post("/speak")
# async def gateway_speak(request: Request):
#     """
#     Gateway endpoint to forward text-to-speech requests to the T2S service.
#     """
#     try:
#         body = await request.json()
#         logger.info(f"Gateway received T2S request")
        
#         async with httpx.AsyncClient(timeout=60) as client:
#             t2s_response = await client.post(
#                 f"{T2S_SERVICE_URL}/speak",
#                 json=body,
#                 timeout=60.0
#             )
#             t2s_response.raise_for_status()
            
#         # Return the binary audio data with proper headers
#         return Response(
#             content=t2s_response.content,
#             media_type=t2s_response.headers.get("content-type", "audio/mpeg")
#         )
    
#     except httpx.RequestError as exc:
#         logger.error(f"Error connecting to T2S service: {exc}")
#         raise HTTPException(status_code=503, detail=f"T2S service unavailable: {str(exc)}")
    
#     except Exception as e:
#         logger.error(f"Unexpected error in gateway_speak: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

@app.get("/status")
async def get_status():
    """
    Check the status of all microservices.
    """
    services_status = {
        "gateway": {
            "service": "Gateway Service",
            "port": GATEWAY_SERVICE_PORT,
            "status": "running"
        }
    }
    
    # Check RAG service status
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{RAG_SERVICE_URL}/status")
            if response.status_code == 200:
                services_status["rag"] = response.json()
            else:
                services_status["rag"] = {
                    "service": "RAG Service",
                    "status": "error",
                    "details": f"Status code: {response.status_code}"
                }
    except Exception as e:
        services_status["rag"] = {
            "service": "RAG Service",
            "status": "unavailable",
            "details": str(e)
        }
    
    # Check T2S service status
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{T2S_SERVICE_URL}/status")
            if response.status_code == 200:
                services_status["t2s"] = response.json()
            else:
                services_status["t2s"] = {
                    "service": "Text-to-Speech Service",
                    "status": "error",
                    "details": f"Status code: {response.status_code}"
                }
    except Exception as e:
        services_status["t2s"] = {
            "service": "Text-to-Speech Service",
            "status": "unavailable",
            "details": str(e)
        }
    
    # Check LLM service status
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            # Assuming LLM service also has a /status endpoint
            response = await client.get(f"{LLM_SERVICE_URL}/status")
            if response.status_code == 200:
                services_status["llm"] = response.json()
            else:
                services_status["llm"] = {
                    "service": "LLM Service",
                    "status": "error",
                    "details": f"Status code: {response.status_code}"
                }
    except Exception as e:
        services_status["llm"] = {
            "service": "LLM Service",
            "status": "unavailable",
            "details": str(e)
        }

    return services_status


@app.get("/")
async def read_root():
    """
    Root endpoint to check if the gateway_service service is running.
    """
    return {"message": "Gateway Service Running", "port": GATEWAY_SERVICE_PORT}


# @app.post("/generate", response_model=LLMServiceResponse)
# async def gateway_generate(request: LLMServiceRequest):
#     """
#     Gateway endpoint to forward generation requests to the LLM service
#     """
#     logger.info(f"Gateway received LLM generation request")
    
#     try:
#         async with httpx.AsyncClient(timeout=270) as client:
#             llm_response = await client.post(
#                 f"{LLM_SERVICE_URL}/generate",
#                 json=request.model_dump(),
#                 timeout=270
#             )
#             llm_response.raise_for_status()
#             return llm_response.json()
            
#     except httpx.RequestError as exc:
#         logger.error(f"Error connecting to LLM service: {exc}")
#         raise HTTPException(status_code=503, detail="LLM service unavailable")
#     except httpx.HTTPStatusError as exc:
#         logger.error(f"LLM service returned error: {exc.response.text}")
#         raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text)

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, List[str]] = {
            "llm": [LLM_SERVICE_URL],
            "rag": [RAG_SERVICE_URL],
            "t2s": [T2S_SERVICE_URL]
        }
    
    def get_service(self, name: str) -> str:
        if not self.services.get(name):
            raise HTTPException(status_code=404, detail="Service not found")
        return random.choice(self.services[name])

service_registry = ServiceRegistry()

@app.middleware("http")
async def circuit_breaker_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"message": "Service unavailable"}
        )

@circuit(failure_threshold=3, recovery_timeout=30)
async def call_service(client, url, data):
    return await client.post(url, json=data)

@app.get("/health")
async def health_check():
    return {"status": "ok"}