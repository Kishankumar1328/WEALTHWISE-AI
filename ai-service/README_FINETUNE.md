# 🚀 Pro LLM Finetuning Guide: WealthWise AI Analyst

This guide outlines the professional workflow for finetuning Gemma 2B (or any SOTA LLM) specifically for SME Financial Analysis.

## 1. Data Generation (Synthetic SFT)
Pro developers don't wait for real data; they generate high-fidelity synthetic data.
- **Script**: `scripts/generate_sft_data.py`
- **Output**: `sft_dataset.jsonl`
- **Purpose**: Teaches the model the "WealthWise Tone," structure, and Indian financial domain knowledge.

## 2. Supervised Fine-Tuning (SFT)
Use **Unsloth** or **Axolotl** for the fastest training on consumer GPUs.
- **Model**: `gemma-2b-it`
- **Technique**: QLoRA (4-bit quantization with LoRA adapters)
- **Target**: Learn to follow instructions and format responses as structured financial reports.

```python
# Pro snippet for Unsloth finetuning
from unsloth import FastLanguageModel
model, tokenizer = FastLanguageModel.from_pretrained("unsloth/gemma-2b-bnb-4bit")
# ... Add LoRA ...
# ... Train on sft_dataset.jsonl ...
```

## 3. Direct Preference Optimization (DPO)
To make the "Pro" analyst sound even better, use DPO to align the model's tone.
- **Positive**: Direct, data-driven, numbered lists.
- **Negative**: Conversational filler, vague advice, plain paragraphs.

## 4. Quantization & Deployment (Ollama)
Once finetuned:
1. Export to **GGUF** format.
2. Use the provided `Modelfile` to build the local image.

```bash
# Register the pro model in Ollama
ollama create wealthwise-analyst -f ./Modelfile
```

## 5. Parameter Tuning
A Pro developer balances creativity and stability:
- `temperature: 0.2` (Low for financial stability)
- `top_p: 0.8` (Focus on high-probability tokens)
- `repeat_penalty: 1.1` (Prevent bullet point loops)
