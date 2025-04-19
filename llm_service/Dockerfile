# Use official Python image
FROM python:3.13-slim

RUN pip install --upgrade pip

#RUN adduser user
#USER user
#WORKDIR /home/user/app

## Set working directory inside the container
WORKDIR /app

# Copy microservice code into the container
COPY llm_service/ /app

# Install shared module
COPY ../shared /app/shared

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose FastAPI default port
EXPOSE 8000

# Set entrypoint
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
ENTRYPOINT exec uvicorn main:app --host 0.0.0.0 --port 8000