"""
Responsible from loading the LLM model
"""

import torch
import os
from pathlib import Path
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from shared.config import MODEL_CACHE_DIR, DEFAULT_MODEL


def load_model_and_pipeline(model_name: str = DEFAULT_MODEL):
    return "ERROR: Fallback local model removed"
    # model_path = MODEL_CACHE_DIR / model_name
    # model_path = Path(str(model_path).replace("/",os.sep))
    #
    # if model_path.exists():
    #     # print(f"🔁 Loading model from cache at {model_path}...")
    #     model = AutoModelForCausalLM.from_pretrained(
    #         model_path,
    #         device_map="auto",
    #         torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32
    #     )
    #     tokenizer = AutoTokenizer.from_pretrained(model_path)
    # else:
    #     # print(f"🔽️ Downloading model: {model_name}...")
    #     model = AutoModelForCausalLM.from_pretrained(
    #         model_name,
    #         device_map="auto",
    #         torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32
    #     )
    #     tokenizer = AutoTokenizer.from_pretrained(model_name)
    #
    #     model_path.mkdir(parents=True, exist_ok=True)
    #     model.save_pretrained(model_path)
    #     tokenizer.save_pretrained(model_path)
    # # print(f"💾 Model cached at: {model_path}")
    #
    # pipe = pipeline(
    #     "text-generation",
    #     model=model,
    #     tokenizer=tokenizer,
    # )
    #
    # return pipe