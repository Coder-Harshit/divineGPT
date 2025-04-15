"""
Handels logic (using model pipeline)
"""

from .model import load_model_and_pipeline

generator = load_model_and_pipeline()

def generate_response(prompt: str) -> str:
    result = generator(
        prompt,
        max_new_tokens=2000,
        # do_sample=True,
        temperature=0.7,
    )
    return result[0]['generated_text']