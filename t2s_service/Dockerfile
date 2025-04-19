# Builder stage
FROM python:3.13.3-alpine3.21 AS builder
WORKDIR /app

# Create
RUN python -m venv /venv
ENV PATH="/venv/bin:${PATH}"

COPY t2s_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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

COPY --chown=containeruser:containeruser t2s_service/ /app/t2s_service
COPY --chown=containeruser:containeruser ../shared/*.py /app/shared/

# Expose FastAPI default port
EXPOSE 8003

# Set entrypoint
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]