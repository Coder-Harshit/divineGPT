# Builder stage
FROM python:3.13.3-slim-bullseye AS builder
WORKDIR /app

# Create and activate a virtual environment
RUN python -m venv /venv
ENV PATH="/venv/bin:${PATH}"

COPY rag_service/requirements.txt .
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir sentence-transformers

# Final stage
FROM python:3.13.3-alpine3.21
WORKDIR /app
RUN pip install --upgrade pip
RUN adduser --disabled-password --gecos "" containeruser
USER containeruser
# Set the PATH to include the user's local bin directory
ENV PATH="/home/containeruser/.local/bin:${PATH}"

COPY --chown=containeruser:containeruser --from=builder /venv /venv
ENV PATH="/venv/bin:${PATH}"

COPY --chown=containeruser:containeruser rag_service/ /app/rag_service
COPY --chown=containeruser:containeruser ../shared/datasets /app/shared/datasets
COPY --chown=containeruser:containeruser ../shared/*.py /app/shared/
EXPOSE 8001
ENTRYPOINT ["uvicorn", "rag_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
