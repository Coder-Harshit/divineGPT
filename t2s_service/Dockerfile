# Use official Python image
FROM python:3.13-slim

RUN pip install --upgrade pip

# Set working directory inside the container
WORKDIR /app

# Copy microservice code into the container
COPY t2s_service/ /app

# Install shared module
COPY ../shared /app/shared

# Install dependencies
#RUN apt-get update && apt-get install -y ffmpeg && \
#    pip install --no-cache-dir -r requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose FastAPI default port
EXPOSE 8003

# Set entrypoint
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]