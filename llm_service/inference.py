"""
Handles logic (using model pipeline)
"""
import requests
from shared.config import GEMINI_API_KEY, USE_GEMINI, GEMINI_MODEL
from llm_service.model import load_model_and_pipeline
import google.generativeai as genai


print("Initializing LLM pipeline...")
generator = load_model_and_pipeline() if not USE_GEMINI else None
print("LLM pipeline initialized.")

def generate_response(prompt: str) -> str:
    """
    Generates a response using GeminiAPI or local LLM model

    Args:
        prompt: The input prompt string.

    Returns:
        The generated text string, excluding the input prompt.
    """
    if USE_GEMINI:
        return call_gemini(prompt)

    if not generator:
        return "Error: LLM pipeline not ready."

    try:
        outputs = generator(
            prompt,
            max_new_tokens=4000,  
            do_sample=True,       
            temperature=0.7,      
            top_p=0.92,           
            top_k=50,
            repetition_penalty=1.2,
            return_full_text=False,
            clean_up_tokenization_spaces=True
        )

        return outputs[0]['generated_text'].strip()

    except Exception as e:
        return f"Error: LLM generation failed. Details: {str(e)}"

def call_gemini(prompt: str) -> str:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)

        gemini_config = genai.GenerationConfig(
            temperature=0.7,
            max_output_tokens=4000,
            top_p=0.92,
            top_k=50,
        )

        response = model.generate_content(
            prompt,
            generation_config=gemini_config,
        )
        return response.text
    except Exception as e:
        return f"Error: Gemini Generation failed. Details: {str(e)}"