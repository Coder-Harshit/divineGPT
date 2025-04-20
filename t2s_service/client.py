import requests
from shared.config import T2S_SERVICE_URL

def request_tts_audio(text: str, lang: str = "en") -> bytes:
    """
    Sends a text-to-speech request to the T2S service and returns the audio bytes.

    Args:
        text (str): The text to convert to speech.
        lang (str): Language code ('en' or 'hi').

    Returns:
        bytes: MP3 audio bytes.
    """
    try:
        response = requests.post(
            T2S_SERVICE_URL,
            json={"text": text, "lang": lang},
            timeout=20
        )
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"T2S request failed: {e}")
