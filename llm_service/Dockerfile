# Builder stage
#FROM python:3.13 AS builder
#FROM pytorch/pytorch:2.6.0-cuda12.6-cudnn9-runtime AS builder
FROM python:3.13.3-alpine3.21 AS builder
WORKDIR /app

# Create and activate a virtual environment
RUN python -m venv /venv
ENV PATH="/venv/bin:${PATH}"

COPY llm_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
#RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126


# Final stage
#FROM python:3.13-slim
FROM python:3.13.3-alpine3.21
WORKDIR /app
RUN pip install --upgrade pip
RUN adduser --disabled-password --gecos "" containeruser
USER containeruser
# Set the PATH to include the user's local bin directory
ENV PATH="/home/containeruser/.local/bin:${PATH}"

COPY --chown=containeruser:containeruser --from=builder /venv /venv
ENV PATH="/venv/bin:${PATH}"

COPY --chown=containeruser:containeruser llm_service/ /app/llm_service
#COPY --chown=containeruser:containeruser ../shared/models/ /app/shared/models
COPY --chown=containeruser:containeruser ../shared/*.py /app/shared/
EXPOSE 8000
ENTRYPOINT ["uvicorn", "llm_service.main:app", "--host", "0.0.0.0", "--port", "8000"]