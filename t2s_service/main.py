from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from gtts import gTTS
from io import BytesIO
from fastapi.responses import StreamingResponse
from shared.logger import get_logger
from shared.config import T2S_SERVICE_PORT

app = FastAPI(title="DivineGPT - Text to Speech Service")
logger = get_logger("T2S Service")

class T2SRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech (max 1000 characters)")
    lang: str = Field(default="en", description="Language code: 'en' or 'hi' for English & Hindi respectively")

@app.post("/speak")
async def speak(request: T2SRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if len(request.text) > 1000:
        raise HTTPException(status_code=413, detail="Text too long. Please keep under 1000 characters.")

    try:
        logger.info(f"T2S: Generating audio for lang={request.lang} for text (first 100 chars): {request.text[:100]}")
        tts = gTTS(text=request.text, lang=request.lang)
        mp3_fp = BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"T2S generation failed: {e}")
        raise HTTPException(status_code=500, detail="T2S generation failed.")

@app.get("/")
def root():
    return {"message": "T2S Service Running", "port": T2S_SERVICE_PORT}

@app.get("/status")
async def get_status():
    return {
        "service": "Text-2-Speech Service",
        "port": T2S_SERVICE_PORT,
        "status": "running",
    }
