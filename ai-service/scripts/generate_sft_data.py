import json
import random

# A Pro AI Developer knows that high-quality synthetic data is the secret to great LLMs
# This script generates a Supervised Fine-Tuning (SFT) dataset for SME Financial Analysis

INDUSTRIES = ["Manufacturing", "Retail", "IT Services", "Healthcare", "Logistics", "Ecommerce"]
SCENARIOS = [
    {
        "input": "Turnover {turnover}, Current Ratio {cr}, Debt/Equity {de}",
        "focus": "liquidity and debt"
    },
    {
        "input": "How can I improve my GST compliance score? Current score is {gst}",
        "focus": "compliance"
    },
    {
        "input": "Forecast my revenue for the next quarter. Last 3 months: {rev1}, {rev2}, {rev3}",
        "focus": "forecasting"
    }
]

def generate_analyst_response(scenario, data):
    # Pro behavior: Data-driven, structured, actionable
    if scenario["focus"] == "liquidity and debt":
        cr = data['cr']
        status = "CRITICAL" if cr < 1.0 else "FAIR" if cr < 1.2 else "STRONG"
        return f"### Executive Summary\nYour business is in a **{status}** liquidity position.\n\n### Key Insights\n- Current Ratio of {cr} is {'below' if cr < 1.2 else 'above'} the industry benchmark of 1.2.\n- Debt-to-Equity is {data['de']}, suggesting {'high' if data['de'] > 1.5 else 'moderate'} leverage.\n\n### Action Plan\n1. Optimize inventory turnover to free up cash.\n2. Review debt-servicing coverage ratio (DSCR)."
    
    elif scenario["focus"] == "compliance":
        gst = data['gst']
        return f"### Executive Summary\nYour GST compliance score is **{gst}/100**.\n\n### Recommendations\n1. **Timely Filing**: Ensure GSTR-1 and GSTR-3B are filed by the 20th of every month.\n2. **Reconciliation**: Perform monthly GSTR-2B reconciliation to claim maximum ITC."

    return "### Analysis\nStandard financial analysis based on provided metrics."

def create_dataset(count=50):
    dataset = []
    for _ in range(count):
        industry = random.choice(INDUSTRIES)
        scenario = random.choice(SCENARIOS)
        
        # Random sample data
        data = {
            "turnover": f"₹{random.randint(10, 500)}L",
            "cr": round(random.uniform(0.5, 2.5), 2),
            "de": round(random.uniform(0.1, 3.0), 2),
            "gst": random.randint(40, 100),
            "rev1": random.randint(5, 50),
            "rev2": random.randint(5, 50),
            "rev3": random.randint(5, 50),
        }
        
        user_query = scenario["input"].format(**data)
        assistant_response = generate_analyst_response(scenario, data)
        
        # Pro Format: Alpaca / ShareGPT / OpenAI
        item = {
            "instruction": "You are a Senior Financial Analyst. Analyze the following SME data.",
            "input": f"Industry: {industry}. Query: {user_query}",
            "output": assistant_response
        }
        dataset.append(item)
    
    return dataset

if __name__ == "__main__":
    print("🚀 Generating professional synthetic dataset...")
    data = create_dataset(100)
    with open("sft_dataset.jsonl", "w", encoding="utf-8") as f:
        for entry in data:
            f.write(json.dumps(entry) + "\n")
    print(f"✅ Generated 100 high-quality samples in sft_dataset.jsonl")
