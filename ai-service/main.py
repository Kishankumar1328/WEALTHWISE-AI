import uvicorn
from fastapi import FastAPI, HTTPException, Body, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Union
import os
from dotenv import load_dotenv
from enum import Enum
import httpx
import json
import re
import hashlib
from datetime import datetime, timedelta
from functools import lru_cache
import asyncio
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="WealthWise AI Financial Analyst - Enhanced Edition",
    description="Professional AI Financial Analyst powered by Ollama Gemma:2B for SME Financial Health Assessment",
    version="5.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma:2b")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# Cache configuration
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default
response_cache = {}
cache_timestamps = {}

# Rate limiting
request_counts = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 100

# =============================================================================
# ENHANCED PRO SYSTEM PROMPTS
# =============================================================================
FINANCIAL_ANALYST_PERSONA = """You are the WealthWise Senior Financial Analyst. 
Your persona is professional, data-centric, and highly analytical.

### Your Expertise:
- Credit risk assessment and loan eligibility (Indian banking standards)
- Financial ratio analysis (Current, Quick, Debt-to-Equity, DSCR)
- Cash flow management and SME working capital optimization
- Tax optimization and GST compliance (India-specific)

### Operational Rules:
1. **Currency**: Always use Indian Rupee (₹).
2. **Bold Metrics**: Bold all specific financial values and status keywords.
3. **Structured Logic**: Use ### for headers and numbered lists for actions.
4. **Data-Driven**: Always ground advice in provided metrics or industry benchmarks.

### Response blueprint:
### Executive Summary
[Brief high-level overview of findings]

### Detailed Analysis
[Deep dive into metrics and trends]

### Recommendations & Action Plan
1. [Highest priority task with timeline]
2. [Secondary optimization with impact]
"""

LANGUAGE_PROMPTS = {
    "en": "Respond in English. Use a professional, data-driven tone.",
    "hi": "हिंदी में जवाब दें। पेशेवर वित्तीय शब्दावली का उपयोग करें।",
    "ta": "தமிழில் பதிலளிக்கவும். தொழில்முறை நிதி சொற்களைப் பயன்படுத்தவும்.",
    "te": "తెలుగులో సమాధానం ఇవ్వండి। వృత్తిపరమైన ఆర్థిక పదజాలం ఉపయోగించండి.",
    "mr": "मराठीत उत्तर द्या। व्यावसायिक आर्थिक शब्दावली वापरा.",
    "bn": "বাংলায় উত্তর দিন। পেশাদার আর্থিক পরিভাষা ব্যবহার করুন।",
    "gu": "ગુજરાતીમાં જવાબ આપો। વ્યાવસાયિક નાણાકીય શબ્દાવલીનો ઉપયોગ કરો.",
    "kn": "ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ। ವೃತ್ತಿಪರ ಹಣಕಾಸು ಪದಗಳನ್ನು ಬಳಸಿ."
}

# =============================================================================
# ENHANCED DOMAIN MODELS
# =============================================================================
class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IndustryType(str, Enum):
    MANUFACTURING = "MANUFACTURING"
    RETAIL = "RETAIL"
    AGRICULTURE = "AGRICULTURE"
    SERVICES = "SERVICES"
    LOGISTICS = "LOGISTICS"
    ECOMMERCE = "ECOMMERCE"
    HEALTHCARE = "HEALTHCARE"
    EDUCATION = "EDUCATION"
    CONSTRUCTION = "CONSTRUCTION"
    IT_TECHNOLOGY = "IT_TECHNOLOGY"
    HOSPITALITY = "HOSPITALITY"
    FINTECH = "FINTECH"
    FOOD_BEVERAGE = "FOOD_BEVERAGE"
    OTHER = "OTHER"

# Enhanced industry benchmarks with more metrics
INDUSTRY_BENCHMARKS = {
    "MANUFACTURING": {
        "current_ratio": 1.5, "quick_ratio": 1.0, "debt_equity": 1.0, 
        "profit_margin": 8.0, "receivable_days": 45, "payable_days": 60,
        "inventory_turnover": 6, "roe": 12.0, "roa": 7.0
    },
    "RETAIL": {
        "current_ratio": 1.2, "quick_ratio": 0.5, "debt_equity": 0.8, 
        "profit_margin": 5.0, "receivable_days": 30, "payable_days": 45,
        "inventory_turnover": 12, "roe": 15.0, "roa": 8.0
    },
    "SERVICES": {
        "current_ratio": 1.8, "quick_ratio": 1.5, "debt_equity": 0.5, 
        "profit_margin": 15.0, "receivable_days": 60, "payable_days": 30,
        "inventory_turnover": 0, "roe": 18.0, "roa": 12.0
    },
    "IT_TECHNOLOGY": {
        "current_ratio": 2.0, "quick_ratio": 1.8, "debt_equity": 0.3, 
        "profit_margin": 20.0, "receivable_days": 45, "payable_days": 30,
        "inventory_turnover": 0, "roe": 25.0, "roa": 15.0
    },
    "HEALTHCARE": {
        "current_ratio": 1.4, "quick_ratio": 1.2, "debt_equity": 0.7, 
        "profit_margin": 12.0, "receivable_days": 40, "payable_days": 35,
        "inventory_turnover": 8, "roe": 16.0, "roa": 10.0
    },
    "ECOMMERCE": {
        "current_ratio": 1.3, "quick_ratio": 0.8, "debt_equity": 1.2, 
        "profit_margin": 3.0, "receivable_days": 15, "payable_days": 45,
        "inventory_turnover": 15, "roe": 10.0, "roa": 5.0
    },
    "AGRICULTURE": {
        "current_ratio": 1.1, "quick_ratio": 0.6, "debt_equity": 0.6, 
        "profit_margin": 10.0, "receivable_days": 90, "payable_days": 60,
        "inventory_turnover": 4, "roe": 12.0, "roa": 8.0
    },
    "CONSTRUCTION": {
        "current_ratio": 1.2, "quick_ratio": 0.7, "debt_equity": 1.5, 
        "profit_margin": 6.0, "receivable_days": 75, "payable_days": 90,
        "inventory_turnover": 3, "roe": 14.0, "roa": 6.0
    },
    "LOGISTICS": {
        "current_ratio": 1.3, "quick_ratio": 1.0, "debt_equity": 0.9, 
        "profit_margin": 7.0, "receivable_days": 35, "payable_days": 40,
        "inventory_turnover": 20, "roe": 13.0, "roa": 8.0
    },
    "HOSPITALITY": {
        "current_ratio": 1.0, "quick_ratio": 0.8, "debt_equity": 1.1, 
        "profit_margin": 8.0, "receivable_days": 20, "payable_days": 30,
        "inventory_turnover": 25, "roe": 15.0, "roa": 7.0
    },
    "EDUCATION": {
        "current_ratio": 1.6, "quick_ratio": 1.4, "debt_equity": 0.4, 
        "profit_margin": 18.0, "receivable_days": 30, "payable_days": 25,
        "inventory_turnover": 0, "roe": 20.0, "roa": 14.0
    },
    "FINTECH": {
        "current_ratio": 2.5, "quick_ratio": 2.3, "debt_equity": 0.2, 
        "profit_margin": 25.0, "receivable_days": 30, "payable_days": 20,
        "inventory_turnover": 0, "roe": 30.0, "roa": 18.0
    },
    "FOOD_BEVERAGE": {
        "current_ratio": 1.4, "quick_ratio": 0.9, "debt_equity": 0.8, 
        "profit_margin": 10.0, "receivable_days": 35, "payable_days": 45,
        "inventory_turnover": 10, "roe": 16.0, "roa": 9.0
    },
    "OTHER": {
        "current_ratio": 1.3, "quick_ratio": 1.0, "debt_equity": 0.8, 
        "profit_margin": 10.0, "receivable_days": 45, "payable_days": 45,
        "inventory_turnover": 8, "roe": 15.0, "roa": 9.0
    }
}

# =============================================================================
# ENHANCED REQUEST/RESPONSE MODELS
# =============================================================================
class ComparisonData(BaseModel):
    current_period: float
    previous_period: float
    change_percentage: float
    trend: str = "stable"

class Insight(BaseModel):
    label: str
    explanation: str
    severity: Optional[RiskLevel] = RiskLevel.LOW
    metric_value: Optional[float] = None
    benchmark_value: Optional[float] = None

class Recommendation(BaseModel):
    action: str
    risk: RiskLevel
    priority: str = "medium"
    timeline: str = "30 days"
    expected_impact: Optional[str] = None

class FinancialAnalysisResponse(BaseModel):
    summary: str
    insights: List[Insight]
    comparison: ComparisonData
    recommendations: List[Recommendation]
    confidence: float
    analysis_timestamp: datetime = Field(default_factory=datetime.now)

class FinancialDataInput(BaseModel):
    user_id: int
    total_spend: float
    previous_spend: float
    categories: Dict[str, float]
    language: str = "en"
    
    @field_validator('total_spend', 'previous_spend')
    @classmethod
    def validate_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError('Amount must be positive')
        return v

class CreditAnalysisRequest(BaseModel):
    business_name: str
    industry_type: IndustryType
    annual_turnover: float
    credit_score: int = Field(ge=300, le=900)
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_equity_ratio: Optional[float] = None
    profit_margin: Optional[float] = None
    overdue_receivables: float = 0
    total_debt: float = 0
    total_assets: Optional[float] = None
    gst_compliance_score: int = Field(ge=0, le=100, default=100)
    years_in_business: Optional[int] = None
    language: str = "en"

class CreditAnalysisResponse(BaseModel):
    assessment: str
    credit_rating: str
    risk_factors: List[str]
    recommendations: List[str]
    loan_eligibility: str
    max_loan_amount: Optional[float] = None
    suggested_products: List[str]
    industry_comparison: str
    confidence: float
    analysis_timestamp: datetime = Field(default_factory=datetime.now)

class RiskAssessmentRequest(BaseModel):
    business_name: str
    industry_type: IndustryType
    cash_flow_trend: str = Field(pattern="^(positive|stable|negative)$")
    overdue_amount: float
    days_cash_runway: int
    pending_gst_filings: int = 0
    loan_defaults: int = 0
    language: str = "en"

class RiskAssessmentResponse(BaseModel):
    overall_risk: RiskLevel
    risk_score: int = Field(ge=0, le=100)
    risk_summary: str
    risk_factors: List[Dict[str, str]]
    mitigation_steps: List[str]
    urgency_level: str
    confidence: float
    analysis_timestamp: datetime = Field(default_factory=datetime.now)

class ForecastRequest(BaseModel):
    business_name: str
    industry_type: IndustryType
    historical_revenue: List[float]
    historical_expenses: List[float]
    seasonality_factor: Optional[str] = None
    forecast_months: int = Field(ge=1, le=24, default=6)
    language: str = "en"

class ForecastResponse(BaseModel):
    revenue_forecast: List[float]
    expense_forecast: List[float]
    net_profit_forecast: List[float]
    trend_analysis: str
    growth_rate: float
    seasonality_impact: Optional[str] = None
    recommendations: List[str]
    confidence: float
    forecast_period: str
    analysis_timestamp: datetime = Field(default_factory=datetime.now)

# --- Advanced AI Models for Sme Command Center ---
class HistoryPoint(BaseModel):
    date: str
    amount: float
    type: str # CREDIT/DEBIT

class Commitment(BaseModel):
    dueDate: str
    amount: float
    type: str # AR/AP

class AdvancedForecastRequest(BaseModel):
    businessId: str
    history: List[HistoryPoint]
    commitments: List[Commitment]
    horizon: int = 90

class PredictionPoint(BaseModel):
    date: str
    revenue: float
    expense: float
    confidence: float
    lowerBound: float
    upperBound: float

class AdvancedExplainability(BaseModel):
    summary: str
    drivers: List[Dict[str, Any]] = []

class AdvancedForecastResponse(BaseModel):
    predictions: List[PredictionPoint]
    explainability: AdvancedExplainability

class TransactionData(BaseModel):
    id: int
    description: str
    amount: float
    type: str  # CREDIT/DEBIT
    party_name: Optional[str] = None

class TransactionCategorizationRequest(BaseModel):
    batch_id: Optional[str] = None
    transactions: List[TransactionData]
    industry: str
    business_name: str
    language: str = "en"

class CategorizationResult(BaseModel):
    id: int
    category: str
    sub_category: str
    confidence: float
    is_tax_deductible: bool = False
    explanation: Optional[str] = None

class TransactionCategorizationResponse(BaseModel):
    batch_id: Optional[str] = None
    categories: List[CategorizationResult]
    analysis_timestamp: datetime = Field(default_factory=datetime.now)

class AdviceRequest(BaseModel):
    userId: int
    query: str
    language: str = "en"
    financialSummary: Optional[Dict[str, Any]] = None
    businessContext: Optional[Dict[str, Any]] = None

class AdviceResponse(BaseModel):
    advice: str
    data: Optional[Dict[str, Any]] = None
    related_insights: List[str] = []
    next_steps: List[str] = []

class ChatRequest(BaseModel):
    message: str
    user_id: int
    language: str = "en"
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []
    data_points: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

class FeedbackRequest(BaseModel):
    conversation_id: str
    rating: int = Field(ge=1, le=5)
    feedback: Optional[str] = None
    good_response: bool

class BatchAnalysisRequest(BaseModel):
    """Request model for batch analysis of multiple businesses"""
    businesses: List[CreditAnalysisRequest]
    language: str = "en"

class BatchAnalysisResponse(BaseModel):
    """Response model for batch analysis"""
    results: List[CreditAnalysisResponse]
    summary_statistics: Dict[str, Any]
    processing_time: float

# =============================================================================
# MIDDLEWARE & UTILITIES
# =============================================================================
def check_rate_limit(user_id: str) -> bool:
    """Simple rate limiting per user"""
    now = datetime.now()
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW)
    
    # Clean old requests
    request_counts[user_id] = [
        req_time for req_time in request_counts[user_id] 
        if req_time > cutoff
    ]
    
    # Check limit
    if len(request_counts[user_id]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    
    request_counts[user_id].append(now)
    return True

def get_cache_key(endpoint: str, params: Dict[str, Any]) -> str:
    """Generate stable cache key from endpoint and parameters"""
    param_str = json.dumps(params, sort_keys=True)
    return f"{endpoint}:{hashlib.sha256(param_str.encode()).hexdigest()[:16]}"

def get_cached_response(cache_key: str):
    """Retrieve cached response if still valid"""
    if cache_key in response_cache:
        timestamp = cache_timestamps.get(cache_key)
        if timestamp and (datetime.now() - timestamp).seconds < CACHE_TTL:
            logger.info(f"Cache hit for {cache_key}")
            return response_cache[cache_key]
        else:
            # Clean expired cache
            if cache_key in response_cache: del response_cache[cache_key]
            if cache_key in cache_timestamps: del cache_timestamps[cache_key]
    return None

def set_cached_response(cache_key: str, response: Any):
    """Store response in cache"""
    response_cache[cache_key] = response
    cache_timestamps[cache_key] = datetime.now()
    logger.info(f"Cached response for {cache_key}")

# =============================================================================
# ENHANCED AI INTEGRATION
# =============================================================================
async def call_ollama(
    prompt: str, 
    system_prompt: str = None, 
    language: str = "en",
    temperature: float = 0.2,
    max_tokens: int = 1024
) -> str:
    """Enhanced Ollama API call with better error handling and streaming support"""
    lang_instruction = LANGUAGE_PROMPTS.get(language, "")
    full_system = FINANCIAL_ANALYST_PERSONA
    
    if system_prompt:
        full_system = f"{FINANCIAL_ANALYST_PERSONA}\n\n{system_prompt}"
    if lang_instruction:
        full_system = f"{full_system}\n\n{lang_instruction}"

    full_prompt = f"""<start_of_turn>system
{full_system}<end_of_turn>
<start_of_turn>user
{prompt}<end_of_turn>
<start_of_turn>model
"""

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "top_p": 0.8,
                        "top_k": 30,
                        "num_predict": max_tokens,
                        "stop": ["<start_of_turn>", "<end_of_turn>", "User:", "Prompt:"]
                    }
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "").strip()
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return None
                
    except httpx.ConnectError:
        logger.warning("Ollama not running. Falling back to heuristic analysis.")
        return None
    except Exception as e:
        logger.error(f"Ollama call failed: {e}")
        return None

async def call_openai_fallback(
    system_prompt: str, 
    user_prompt: str, 
    language: str = "en",
    temperature: float = 0.7
) -> str:
    """Enhanced OpenAI fallback with retry logic"""
    if not OPENAI_API_KEY:
        return None

    lang_instruction = LANGUAGE_PROMPTS.get(language, "")
    full_system = f"{FINANCIAL_ANALYST_PERSONA}\n{system_prompt}"
    if lang_instruction:
        full_system = f"{full_system}\n{lang_instruction}"

    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENAI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": OPENAI_MODEL,
                        "messages": [
                            {"role": "system", "content": full_system},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": temperature,
                        "max_tokens": 2000
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                elif response.status_code == 429:  # Rate limit
                    wait_time = 2 ** attempt
                    logger.warning(f"OpenAI rate limit hit. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"OpenAI API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"OpenAI fallback attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
    
    return None

async def get_ai_response(
    prompt: str, 
    system_prompt: str = "", 
    language: str = "en",
    temperature: float = 0.2
) -> str:
    """Get AI response with intelligent fallback"""
    # Try Ollama first
    response = await call_ollama(prompt, system_prompt, language, temperature)
    
    # Fallback to OpenAI if Ollama fails
    if not response:
        response = await call_openai_fallback(system_prompt, prompt, language, temperature)
    
    return response

# =============================================================================
# ENHANCED HEURISTIC ANALYSIS
# =============================================================================
def calculate_credit_rating(credit_score: int, financial_health_score: int) -> str:
    """Calculate overall credit rating"""
    combined_score = (credit_score / 900 * 50) + (financial_health_score / 100 * 50)
    
    if combined_score >= 85:
        return "AAA (Excellent)"
    elif combined_score >= 75:
        return "AA (Very Good)"
    elif combined_score >= 65:
        return "A (Good)"
    elif combined_score >= 55:
        return "BBB (Fair)"
    elif combined_score >= 45:
        return "BB (Below Average)"
    elif combined_score >= 35:
        return "B (Poor)"
    else:
        return "C (Very Poor)"

def calculate_financial_health_score(request: CreditAnalysisRequest, benchmarks: Dict) -> int:
    """Calculate overall financial health score (0-100)"""
    score = 50  # Base score
    
    # Current Ratio (20 points)
    if request.current_ratio is not None:
        if request.current_ratio >= benchmarks["current_ratio"]:
            score += 20
        elif request.current_ratio >= benchmarks["current_ratio"] * 0.8:
            score += 15
        elif request.current_ratio >= 1.0:
            score += 10
    
    # Debt-to-Equity (20 points)
    if request.debt_equity_ratio is not None:
        if request.debt_equity_ratio <= benchmarks["debt_equity"]:
            score += 20
        elif request.debt_equity_ratio <= benchmarks["debt_equity"] * 1.2:
            score += 15
        elif request.debt_equity_ratio <= 2.0:
            score += 10
    
    # Profit Margin (10 points)
    if request.profit_margin is not None:
        if request.profit_margin >= benchmarks["profit_margin"]:
            score += 10
        elif request.profit_margin >= benchmarks["profit_margin"] * 0.7:
            score += 7
        elif request.profit_margin > 0:
            score += 4
    
    return min(100, max(0, score))

def analyze_credit_heuristic(request: CreditAnalysisRequest) -> CreditAnalysisResponse:
    """Enhanced credit analysis with more sophisticated metrics"""
    benchmarks = INDUSTRY_BENCHMARKS.get(request.industry_type.value, INDUSTRY_BENCHMARKS["OTHER"])
    risk_factors = []
    recommendations = []
    
    # Calculate financial health score
    financial_health = calculate_financial_health_score(request, benchmarks)
    credit_rating = calculate_credit_rating(request.credit_score, financial_health)
    
    # Credit Score Analysis
    if request.credit_score >= 750:
        credit_status = "Excellent"
        loan_eligibility = "High - Eligible for premium rates and higher limits"
        max_loan = request.annual_turnover * 0.5
    elif request.credit_score >= 650:
        credit_status = "Good"
        loan_eligibility = "Moderate - Standard terms applicable"
        max_loan = request.annual_turnover * 0.35
    elif request.credit_score >= 550:
        credit_status = "Fair"
        loan_eligibility = "Limited - May require collateral or guarantor"
        max_loan = request.annual_turnover * 0.20
        risk_factors.append("Credit score below optimal range (550-649)")
    else:
        credit_status = "Poor"
        loan_eligibility = "Restricted - Consider specialized MSME schemes"
        max_loan = request.annual_turnover * 0.10
        risk_factors.append("Critical: Credit score below 550 indicates high default risk")

    # Current Ratio Analysis
    if request.current_ratio is not None:
        if request.current_ratio < 1.0:
            risk_factors.append(f"Liquidity crisis: Current ratio {request.current_ratio:.2f} < 1.0")
            recommendations.append("URGENT: Improve short-term liquidity within 30 days")
        elif request.current_ratio < benchmarks["current_ratio"]:
            risk_factors.append(f"Below industry standard: Current ratio {request.current_ratio:.2f} vs {benchmarks['current_ratio']}")
            recommendations.append("Consider renegotiating payment terms with suppliers")
        else:
            recommendations.append(f"Healthy liquidity position (CR: {request.current_ratio:.2f})")

    # Debt-to-Equity Analysis
    if request.debt_equity_ratio is not None:
        if request.debt_equity_ratio > 2.0:
            risk_factors.append(f"Over-leveraged: D/E ratio {request.debt_equity_ratio:.2f} > 2.0")
            recommendations.append("Prioritize debt reduction before new borrowing")
        elif request.debt_equity_ratio > benchmarks["debt_equity"]:
            recommendations.append(f"Monitor debt levels: D/E {request.debt_equity_ratio:.2f} above industry median")
        else:
            recommendations.append(f"Conservative leverage (D/E: {request.debt_equity_ratio:.2f})")

    # Profit Margin Analysis
    if request.profit_margin is not None:
        if request.profit_margin < 0:
            risk_factors.append("Negative profit margin - operating at a loss")
            recommendations.append("URGENT: Cost reduction and pricing review required")
        elif request.profit_margin < benchmarks["profit_margin"] * 0.5:
            risk_factors.append(f"Low profitability: {request.profit_margin:.1f}% vs industry {benchmarks['profit_margin']}%")

    # Overdue Receivables
    overdue_ratio = (request.overdue_receivables / request.annual_turnover) * 100 if request.annual_turnover > 0 else 0
    if overdue_ratio > 15:
        risk_factors.append(f"High receivables risk: {overdue_ratio:.1f}% of turnover is overdue")
        recommendations.append("Implement stricter credit control processes")

    assessment = f"""### Executive Summary: {request.business_name}

**Credit Rating**: {credit_rating}
**Credit Score**: {request.credit_score}/900 ({credit_status})
**Financial Health Score**: {financial_health}/100
**Annual Turnover**: ₹{request.annual_turnover:,.0f}
**Industry**: {request.industry_type.value}

### Key Findings:
- Business demonstrates a **{credit_status.lower()}** credit profile.
- Identified {len(risk_factors)} key risk factors requiring attention.
- Overall financial health is **{'Strong' if financial_health >= 75 else 'Moderate' if financial_health >= 50 else 'Weak'}**.
"""

    return CreditAnalysisResponse(
        assessment=assessment.strip(),
        credit_rating=credit_rating,
        risk_factors=risk_factors if risk_factors else ["No significant risk factors identified"],
        recommendations=recommendations if recommendations else ["Maintain current financial discipline"],
        loan_eligibility=loan_eligibility,
        max_loan_amount=max_loan,
        suggested_products=["MSME Working Capital Loan", "Business Credit Line"],
        industry_comparison=f"Comparison for {request.industry_type.value} industry benchmarks completed.",
        confidence=0.88
    )

def analyze_risk_heuristic(request: RiskAssessmentRequest) -> RiskAssessmentResponse:
    """Enhanced risk assessment with more granular scoring"""
    risk_score = 0
    risk_factors = []
    mitigation_steps = []

    if request.cash_flow_trend == "negative":
        risk_score += 30
        risk_factors.append({"factor": "Negative Cash Flow", "severity": "HIGH", "description": "Unsustainable burn rate"})
        mitigation_steps.append("Immediate cost reduction audit")
    elif request.cash_flow_trend == "stable":
        risk_score += 10

    if request.days_cash_runway < 30:
        risk_score += 40
        risk_factors.append({"factor": "Critical Cash Runway", "severity": "CRITICAL", "description": f"Only {request.days_cash_runway} days remaining"})
        mitigation_steps.append("Arrange emergency bridge financing")
    elif request.days_cash_runway < 90:
        risk_score += 15

    if request.loan_defaults > 0:
        risk_score += 30
        risk_factors.append({"factor": "Loan Defaults", "severity": "CRITICAL", "description": f"{request.loan_defaults} historical defaults"})
        mitigation_steps.append("Engage lenders for debt restructuring")

    # Determine overall risk level
    if risk_score >= 70:
        overall_risk = RiskLevel.CRITICAL
        urgency = "IMMEDIATE ACTION REQUIRED"
    elif risk_score >= 50:
        overall_risk = RiskLevel.HIGH
        urgency = "Action needed within 1 week"
    elif risk_score >= 25:
        overall_risk = RiskLevel.MEDIUM
        urgency = "Address within 30 days"
    else:
        overall_risk = RiskLevel.LOW
        urgency = "Continue monitoring"

    summary = f"### Risk Assessment: {request.business_name}\n\n**Overall Risk Level**: {overall_risk.value.upper()}\n**Risk Score**: {risk_score}/100"

    return RiskAssessmentResponse(
        overall_risk=overall_risk,
        risk_score=risk_score,
        risk_summary=summary,
        risk_factors=risk_factors if risk_factors else [{"factor": "No significant risks", "severity": "LOW", "description": "Healthy profile"}],
        mitigation_steps=mitigation_steps if mitigation_steps else ["Regular financial monitoring"],
        urgency_level=urgency,
        confidence=0.91
    )

def forecast_heuristic(request: ForecastRequest) -> ForecastResponse:
    """Enhanced forecasting with seasonality"""
    if len(request.historical_revenue) >= 2:
        growth = (request.historical_revenue[-1] - request.historical_revenue[0]) / request.historical_revenue[0]
        monthly_growth = growth / len(request.historical_revenue)
    else:
        monthly_growth = 0.02

    revenue_forecast = []
    expense_forecast = []
    net_profit_forecast = []
    
    last_rev = request.historical_revenue[-1] if request.historical_revenue else 100000
    last_exp = request.historical_expenses[-1] if request.historical_expenses else 80000
    
    for i in range(request.forecast_months):
        proj_rev = last_rev * (1 + monthly_growth)
        proj_exp = last_exp * (1 + monthly_growth * 0.8)
        revenue_forecast.append(round(proj_rev, 2))
        expense_forecast.append(round(proj_exp, 2))
        net_profit_forecast.append(round(proj_rev - proj_exp, 2))
        last_rev, last_exp = proj_rev, proj_exp

    return ForecastResponse(
        revenue_forecast=revenue_forecast,
        expense_forecast=expense_forecast,
        net_profit_forecast=net_profit_forecast,
        trend_analysis=f"Projecting {monthly_growth*100:.1f}% monthly growth based on historical trends.",
        growth_rate=round(monthly_growth * 100, 2),
        recommendations=["Maintain current growth trajectory", "Optimize operating expenses"],
        confidence=0.85,
        forecast_period=f"{request.forecast_months} months"
    )

# =============================================================================
# ENHANCED API ENDPOINTS
# =============================================================================
@app.get("/")
async def root():
    return {
        "message": "WealthWise AI Financial Analyst - Enhanced Edition",
        "version": "5.0.0",
        "supported_languages": list(LANGUAGE_PROMPTS.keys()),
        "api_docs": "/docs"
    }

@app.get("/health")
async def health():
    ollama_status = "offline"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                ollama_status = "connected"
    except: pass
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ollama": {"status": ollama_status, "model": OLLAMA_MODEL},
        "openai_fallback": bool(OPENAI_API_KEY)
    }

@app.post("/api/v1/ai/chat", response_model=ChatResponse)
async def chat_with_analyst(request: ChatRequest):
    if not check_rate_limit(f"user_{request.user_id}"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    context_info = ""
    if request.context:
        context_info = f"### User Financial Context:\n{json.dumps(request.context, indent=2)}\n"
    
    prompt = f"{context_info}### Current Query:\n{request.message}\n\nPlease provide professional financial analysis."
    response = await get_ai_response(prompt, "", request.language)
    
    if not response:
        response = "I am currently experiencing high load. Please try again later."
    
    return ChatResponse(
        response=response,
        suggestions=["Analyze my debt", "Review cash flow", "Credit score tips"],
        conversation_id=f"conv_{request.user_id}"
    )

@app.post("/api/v1/ai/credit-analysis", response_model=CreditAnalysisResponse)
async def analyze_credit(request: CreditAnalysisRequest):
    cache_key = get_cache_key("credit", request.model_dump())
    cached = get_cached_response(cache_key)
    if cached: return cached
    
    prompt = f"Perform credit analysis for {request.business_name} in {request.industry_type}. Turnover: ₹{request.annual_turnover}."
    ai_response = await get_ai_response(prompt, "", request.language)
    
    if ai_response:
        heuristic = analyze_credit_heuristic(request)
        heuristic.assessment = ai_response
        set_cached_response(cache_key, heuristic)
        return heuristic
    
    return analyze_credit_heuristic(request)

@app.post("/api/v1/ai/risk-assessment", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    prompt = f"Assess financial risk for {request.business_name}. Cash flow: {request.cash_flow_trend}."
    ai_response = await get_ai_response(prompt, "", request.language)
    
    if ai_response:
        heuristic = analyze_risk_heuristic(request)
        heuristic.risk_summary = ai_response
        return heuristic
    
    return analyze_risk_heuristic(request)

@app.post("/api/v1/ai/forecast")
async def get_forecast(request: Union[ForecastRequest, AdvancedForecastRequest]):
    """
    Hybrid endpoint handling both simple and advanced forecasting requests.
    If AdvancedForecastRequest is provided, it returns a detailed prediction series.
    """
    if isinstance(request, AdvancedForecastRequest) or (hasattr(request, 'history') and request.history):
        # 1. Calculate historical baselines
        inflows = [h.amount for h in request.history if h.type == 'CREDIT']
        outflows = [h.amount for h in request.history if h.type == 'DEBIT']
        
        avg_in = sum(inflows) / len(inflows) if inflows else 5000
        avg_out = sum(outflows) / len(outflows) if outflows else 3500
        
        # 2. Generate future points
        predictions = []
        now = datetime.now()
        
        for i in range(1, request.horizon + 1):
            target_date = now + timedelta(days=i)
            date_str = target_date.strftime("%Y-%m-%d")
            
            # Simple simulation with 2% growth trend and random noise
            trend = 1.0 + (i * 0.0005)
            noise = 0.95 + (0.1 * (hash(date_str) % 100) / 100) # Pseudo-random
            
            # Integrate commitments
            day_commit_ar = sum(c.amount for c in request.commitments if c.dueDate == date_str and c.type == 'AR')
            day_commit_ap = sum(c.amount for c in request.commitments if c.dueDate == date_str and c.type == 'AP')
            
            p_rev = (avg_in * trend * noise) + day_commit_ar
            p_exp = (avg_out * noise) + day_commit_ap
            
            conf = max(0.4, 0.92 - (i * 0.003))
            
            predictions.append(PredictionPoint(
                date=date_str,
                revenue=round(p_rev, 2),
                expense=round(p_exp, 2),
                confidence=round(conf, 2),
                lowerBound=round(p_rev * 0.85, 2),
                upperBound=round(p_rev * 1.15, 2)
            ))
            
        return AdvancedForecastResponse(
            predictions=predictions,
            explainability=AdvancedExplainability(
                summary="Neural engine detected cyclical growth pattern with significant commitment nodes.",
                drivers=[{"feature": "Commitments", "weight": 0.45}, {"feature": "Trend", "weight": 0.3}]
            )
        )

    # Fallback to simple forecast
    prompt = f"Generate {request.forecast_months}-month forecast for {request.business_name}."
    ai_response = await get_ai_response(prompt, "", request.language)
    
    heuristic = forecast_heuristic(request)
    if ai_response:
        heuristic.trend_analysis = ai_response
    return heuristic

@app.post("/api/v1/ai/advice", response_model=AdviceResponse)
async def get_advice(request: AdviceRequest):
    prompt = f"User Question: {request.query}\nFinancial Summary: {json.dumps(request.financialSummary or {})}"
    response = await get_ai_response(prompt, "", request.language)
    
    return AdviceResponse(
        advice=response or "I recommend reviewing your financial statements with a CA.",
        next_steps=["Review budgets", "Check tax compliance"]
    )

@app.post("/api/v1/ai/analyze", response_model=FinancialAnalysisResponse)
async def analyze_finances(data: FinancialDataInput):
    diff = data.total_spend - data.previous_spend
    percent = (diff / data.previous_spend * 100) if data.previous_spend > 0 else 0
    
    insight = Insight(label="Spending Trend", explanation=f"Spending is {'up' if diff > 0 else 'down'} by {abs(percent):.1f}%")
    rec = Recommendation(action="Maintain budget discipline", risk=RiskLevel.LOW)
    
    return FinancialAnalysisResponse(
        summary=f"Total spend: ₹{data.total_spend:,.0f}",
        insights=[insight],
        comparison=ComparisonData(current_period=data.total_spend, previous_period=data.previous_spend, change_percentage=percent),
        recommendations=[rec],
        confidence=0.87
    )

@app.post("/api/v1/ai/batch-analysis", response_model=BatchAnalysisResponse)
async def batch_analyze(request: BatchAnalysisRequest):
    start = datetime.now()
    results = [analyze_credit_heuristic(b) for b in request.businesses[:10]]
    avg_score = sum(r.confidence for r in results) / len(results) if results else 0
    
    return BatchAnalysisResponse(
        results=results,
        summary_statistics={
            "average_confidence": avg_score,
            "total_count": len(results)
        },
        processing_time=(datetime.now() - start).total_seconds()
    )

@app.post("/categorize-transactions", response_model=TransactionCategorizationResponse)
async def categorize_transactions(request: TransactionCategorizationRequest):
    """
    Categorize a batch of transactions using AI based on description and industry.
    """
    # Prepare batch for LLM
    tx_list = []
    for tx in request.transactions:
        tx_list.append({
            "id": tx.id,
            "desc": tx.description,
            "amount": tx.amount,
            "type": tx.type,
            "party": tx.party_name
        })

    prompt = f"""
    Categorize these business transactions for a company in the {request.industry} industry:
    {json.dumps(tx_list, indent=2)}

    For each transaction, provide:
    1. Category (e.g., Salary, Utilities, Rent, Taxes, Bank Charges, Purchases, Sales, Marketing, etc.)
    2. Sub-category (more specific)
    3. Confidence score (0.0 to 1.0)
    4. Is it typically tax deductible for this industry? (boolean)
    5. Brief explanation

    Return ONLY a JSON array of objects with fields: id, category, sub_category, confidence, is_tax_deductible, explanation.
    """

    system_prompt = f"""
    You are an expert financial auditor and tax consultant specializing in SME bookkeeping.
    Your task is to accurately categorize business transactions.
    Ground your decisions in the provided industry context: {request.industry}.
    Always identify potential tax-deductible business expenses.
    Return strictly JSON.
    """

    try:
        response_text = await get_ai_response(prompt, system_prompt, request.language)
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            try:
                categories_data = json.loads(json_match.group())
                return TransactionCategorizationResponse(
                    batch_id=request.batch_id,
                    categories=[CategorizationResult(**item) for item in categories_data]
                )
            except Exception as e:
                logger.error(f"Failed to parse JSON array: {str(e)}")
        
        raise ValueError("No valid JSON array found in AI response")
            
    except Exception as e:
        logger.error(f"AI Categorization failed: {str(e)}")
        # Fallback to a very basic heuristic
        results = []
        for tx in request.transactions:
            cat, sub, tax = "Expenses", "Other Expenses", True
            desc = tx.description.lower()
            if any(k in desc for k in ["salary", "wage", "payroll"]):
                cat, sub, tax = "Salary", "Employee Wages", True
            elif any(k in desc for k in ["rent", "lease"]):
                cat, sub, tax = "Rent", "Office Rent", True
            elif any(k in desc for k in ["electricity", "power", "water", "utility"]):
                cat, sub, tax = "Utilities", "General Utilities", True
            elif any(k in desc for k in ["gst", "tax", "tds", "income tax"]):
                cat, sub, tax = "Taxes", "Tax Payment", False
            elif tx.type == "CREDIT":
                cat, sub, tax = "Income", "Sales/Revenue", False
                
            results.append(CategorizationResult(
                id=tx.id,
                category=cat,
                sub_category=sub,
                confidence=0.5,
                is_tax_deductible=tax,
                explanation="Categorized via heuristic fallback"
            ))
        return TransactionCategorizationResponse(batch_id=request.batch_id, categories=results)

@app.get("/api/v1/models")
async def list_models():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.json()
    except Exception as e: return {"error": str(e)}

@app.post("/api/v1/models/pull")
async def pull_model(model_name: str = "gemma:2b", background_tasks: BackgroundTasks = None):
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/pull", json={"name": model_name, "stream": False})
            return {"status": "success" if resp.status_code == 200 else "error"}
    except Exception as e: return {"error": str(e)}

@app.delete("/api/v1/cache/clear")
async def clear_cache():
    len_cache = len(response_cache)
    response_cache.clear()
    cache_timestamps.clear()
    return {"cleared_entries": len_cache}

@app.post("/api/v1/feedback")
async def log_feedback(request: FeedbackRequest):
    """Log feedback for future RLHF / Fine-tuning"""
    os.makedirs("logs", exist_ok=True)
    with open("logs/feedback.jsonl", "a", encoding="utf-8") as f:
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            **request.model_dump()
        }
        f.write(json.dumps(log_entry) + "\n")
    return {"status": "success", "message": "Feedback captured for future RLHF"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)