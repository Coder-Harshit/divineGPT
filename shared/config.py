import os
from pathlib import Path


SHARED_ROOT = Path(__file__).resolve().parent
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", f"{SHARED_ROOT}/models")

DEFAULT_MODEL = "google/gemma-3-1B-it"
DATASET_DIR = SHARED_ROOT / "datasets"

# EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "thenlper/gte-small")

# Hosts
LLM_SERVICE_HOST = os.getenv("LLM_SERVICE_HOST", "localhost")
RAG_SERVICE_HOST = os.getenv("RAG_SERVICE_HOST", "localhost")
T2S_SERVICE_HOST = os.getenv("T2S_SERVICE_HOST", "localhost")
GATEWAY_SERVICE_HOST = os.getenv("GATEWAY_SERVICE_HOST", "localhost")

# Routes
LLM_SERVICE_ROUTE = os.getenv("LLM_SERVICE_ROUTE", "/generate")
RAG_SERVICE_ROUTE = os.getenv("RAG_SERVICE_ROUTE", "/ask")

# Ports
LLM_SERVICE_PORT = int(os.getenv("LLM_SERVICE_PORT", 8000))  # Default port for LLM service
RAG_SERVICE_PORT = int(os.getenv("RAG_SERVICE_PORT", 8001))  # Default port for RAG service
GATEWAY_SERVICE_PORT = int(os.getenv("GATEWAY_SERVICE_PORT", 8002))  # Default port for RAG service
T2S_SERVICE_PORT = int(os.getenv("T2S_SERVICE_PORT", 8003))

# URLs
LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", f"http://{LLM_SERVICE_HOST}:{LLM_SERVICE_PORT}")
RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", f"http://{RAG_SERVICE_HOST}:{RAG_SERVICE_PORT}")
T2S_SERVICE_URL = os.getenv("T2S_SERVICE_URL", f"http://{T2S_SERVICE_HOST}:{T2S_SERVICE_PORT}")
GATEWAY_SERVICE_URL = os.getenv("GATEWAY_SERVICE_URL", f"http://{GATEWAY_SERVICE_HOST}:{GATEWAY_SERVICE_PORT}")

# GEMINI CONFIG
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY","")
USE_GEMINI = os.getenv("USE_GEMINI","True").lower() == "true"
GEMINI_MODEL = "gemini-2.0-flash-lite"

# Qdrant CONFIG
QDRANT_URL = "https://aa5d2ed6-4c67-432c-99c0-8094cf311275.us-east-1-0.aws.cloud.qdrant.io:6333"
QDRANT_PATH = os.getenv("QDRANT_URL", QDRANT_URL)
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")