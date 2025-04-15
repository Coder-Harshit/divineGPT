import os
from pathlib import Path


SHARED_ROOT = Path(__file__).resolve().parent
MODEL_CACHE_DIR = SHARED_ROOT / "models"
DEFAULT_MODEL = "google/gemma-3-1B-it"
DATASET_DIR = SHARED_ROOT / "datasets"

# Hosts
LLM_SERVICE_HOST = os.getenv("LLM_SERVICE_HOST", "localhost")
RAG_SERVICE_HOST = os.getenv("RAG_SERVICE_HOST", "localhost")

# Routes
LLM_SERVICE_ROUTE = os.getenv("LLM_SERVICE_ROUTE", "/generate")
RAG_SERVICE_ROUTE = os.getenv("RAG_SERVICE_ROUTE", "/ask")

# Ports
RAG_SERVICE_PORT = int(os.getenv("RAG_SERVICE_PORT", 8001))  # Default port for RAG service
LLM_SERVICE_PORT = int(os.getenv("LLM_SERVICE_PORT", 8000))  # Default port for LLM service

# URLs
LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", f"http://{LLM_SERVICE_HOST}:{LLM_SERVICE_PORT}{LLM_SERVICE_ROUTE}")
RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", f"http://{RAG_SERVICE_HOST}:{RAG_SERVICE_PORT}{RAG_SERVICE_ROUTE}")
