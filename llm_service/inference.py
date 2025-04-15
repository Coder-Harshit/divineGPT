"""
Handles logic (using model pipeline)
"""
from .model import load_model_and_pipeline

# Load the model and pipeline when the module is imported
# This assumes the LLM service is relatively long-running.
# If it's serverless/short-lived, you might adjust loading strategy.
print("Initializing LLM pipeline...")
generator = load_model_and_pipeline()
print("LLM pipeline initialized.")

def generate_response(prompt: str) -> str:
    """
    Generates a response from the LLM model, returning only the newly generated text.

    Args:
        prompt: The input prompt string.

    Returns:
        The generated text string, excluding the input prompt.
    """
    if not generator:
        print("Error: LLM pipeline (generator) is not available.")
        return "Error: LLM service not ready."

    print(f"Generating response for prompt (first 100 chars): {prompt[:100]}...")
    try:
        # Key Change: Use return_full_text=False
        # Also added clean_up_tokenization_spaces=True as good practice
        outputs = generator(
            prompt,
            max_new_tokens=4000,  # Adjusted slightly, ensure it's enough for JSON + content
            do_sample=True,       # Re-enabled sampling for potentially better creativity
            temperature=0.6,      # Adjusted temperature slightly
            top_p=0.9,            # Added top_p sampling
            return_full_text=False, # *** This is the main fix ***
            clean_up_tokenization_spaces=True
        )

        generated_text = outputs[0]['generated_text']
        print(f"LLM generated text (first 100 chars): {generated_text[:100]}...")
        return generated_text.strip() # Strip any leading/trailing whitespace

    except Exception as e:
        print(f"Error during LLM generation: {e}")
        # Return an error message that the RAG service can potentially handle
        # Avoid returning complex objects or stack traces here.
        return f"Error: LLM generation failed. Details: {str(e)}"

