# backend/main.py - COMPLETE FIXED VERSION
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np
import httpx
import json
import joblib
import string
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = FastAPI()

# ===================================================================
# CRITICAL: CORS MUST BE ADDED BEFORE ANY ROUTES
# ===================================================================

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,https://crop-advisory-delta.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Specific origins
    allow_credentials=True,  # Important: set to True
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)


WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# ===================================================================
# PYDANTIC MODELS
# ===================================================================

class YieldPredictionRequest(BaseModel):
    crop: str
    variety: str
    soil_type: str
    planting_date: str
    land_size_acres: float
    fertilizer_type: str
    fertilizer_rate_kg_per_ha: float
    rainfall_mm: float
    avg_temperature_c: float
    management_score: int
    pest_pressure: int

# ===================================================================
# ML MODEL SETUP
# ===================================================================

print("🔄 Loading pest data and ML models...")

# Load pest data
pest_data = []
try:
    with open('malawi_crop_pests_diseases_v3.json', 'r') as f:
        pest_data = json.load(f).get('malawi_crop_pests_diseases', [])
    print(f"✓ Loaded {len(pest_data)} pest entries")
except FileNotFoundError:
    print("❌ Error: malawi_crop_pests_diseases_v3.json not found")

# Try to load pre-trained models
vectorizer = None
tfidf_matrix = None

try:
    vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
    tfidf_matrix = joblib.load('models/tfidf_matrix.pkl')
    print("✓ Loaded pre-trained TF-IDF vectorizer and matrix")
except FileNotFoundError:
    print("⚠ Pre-trained models not found. Creating new models from corpus...")

# If models don't exist, create them
if vectorizer is None or tfidf_matrix is None:
    if pest_data:
        corpus = []
        for pest in pest_data:
            text = f"{pest.get('common_name', '')} {pest.get('farmer_simple_description', '')} {' '.join(pest.get('key_symptoms', []))}"
            corpus.append(text)
        
        vectorizer = TfidfVectorizer(
            stop_words='english',
            lowercase=True,
            max_features=5000,
            min_df=1,
            max_df=0.9
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        os.makedirs('models', exist_ok=True)
        joblib.dump(vectorizer, 'models/tfidf_vectorizer.pkl')
        joblib.dump(tfidf_matrix, 'models/tfidf_matrix.pkl')
        print(f"✓ Created and saved TF-IDF models ({len(corpus)} documents)")

# ===================================================================
# HELPER FUNCTIONS
# ===================================================================

def preprocess_query(query: str) -> str:
    """Preprocess farmer query"""
    query = query.lower()
    query = query.translate(str.maketrans('', '', string.punctuation))
    query = re.sub(r'\d+', '', query)
    query = ' '.join(query.split())
    return query

def get_confidence(score: float) -> str:
    """Determine confidence level based on similarity score"""
    if score > 0.35:
        return "High"
    elif score > 0.20:
        return "Medium"
    else:
        return "Low"

def get_variety_maturity(crop: str, variety: str) -> int:
    """Get maturity days for variety"""
    maturity_data = {
        'Kanyani': 120, 'SC 403': 125, 'MH 18': 115, 'MH 19': 120, 'MH 20': 125,
        'DK 8031': 135, 'DK 8053': 140, 'SC 627': 130,
        'Chitedze': 140, 'Mwanza': 135, 'Kalima': 130,
        'NERICA 4': 90, 'NERICA 5': 95,
        'CG7': 130, 'MW 348': 75
    }
    return maturity_data.get(variety, 120)

def predict_yield(request: YieldPredictionRequest) -> dict:
    """Simple yield prediction model"""
    base_yields = {
        'Maize': {'Kanyani': 3.5, 'SC 403': 3.2, 'MH 18': 3.8, 'MH 19': 4.0, 'MH 20': 4.2,
                  'DK 8031': 5.5, 'DK 8053': 6.0, 'SC 627': 5.8,
                  'Chitedze': 2.6, 'Mwanza': 2.4, 'Kalima': 2.2},
        'Rice': {'NERICA 4': 3.2, 'NERICA 5': 3.0},
        'Groundnuts': {'CG7': 1.6},
        'Beans': {'MW 348': 1.4}
    }

    base_yield = base_yields.get(request.crop, {}).get(request.variety, 3.0)

    soil_modifiers = {
        'Loam': 1.1, 'Clay Loam': 1.1, 'Sandy Loam': 1.0,
        'Clay': 0.95, 'Silt': 0.9
    }
    soil_modifier = soil_modifiers.get(request.soil_type, 1.0)

    fert_modifiers = {
        '23:10:5': 1.1, 'DAP': 1.1, 'NPK': 1.0,
        'Organic': 0.8, 'No Fertilizer': 0.6
    }
    fert_modifier = 1.0
    for key, value in fert_modifiers.items():
        if key in request.fertilizer_type:
            fert_modifier = value
            break

    if 500 <= request.rainfall_mm <= 700:
        rainfall_modifier = 1.1
    elif 400 <= request.rainfall_mm < 500 or 700 < request.rainfall_mm <= 800:
        rainfall_modifier = 1.0
    else:
        rainfall_modifier = 0.8

    management_modifier = 0.8 + (request.management_score / 100) * 0.4
    pest_modifier = 1.0 - (request.pest_pressure / 100) * 0.3

    yield_per_ha = base_yield * soil_modifier * fert_modifier * rainfall_modifier * management_modifier * pest_modifier
    
    hectares = request.land_size_acres * 0.404686
    total_yield = yield_per_ha * hectares

    return {
        'yield_per_ha': max(0.1, yield_per_ha),
        'total_yield_tonnes': max(0.1, total_yield)
    }

def get_fertilizer_plan(crop: str, variety: str) -> dict:
    """Get fertilizer recommendations"""
    plans = {
        'Maize': {
            'OPV': {'type': '23:10:5 +6S +1Zn + Urea', 'basal': '200 kg/ha at planting',
                    'topdress1': '100 kg/ha Urea at 3-4 weeks', 'topdress2': '50 kg/ha Urea at 6-7 weeks'},
            'Hybrid': {'type': '23:10:5 +6S +1Zn + Urea', 'basal': '250 kg/ha at planting',
                       'topdress1': '125 kg/ha Urea at 3-4 weeks', 'topdress2': '75 kg/ha Urea at 6-7 weeks'},
            'Local': {'type': 'Organic Manure', 'basal': '100 kg/ha at planting',
                      'topdress1': '50 kg/ha Urea at 4 weeks', 'topdress2': 'N/A'}
        },
        'Rice': {'type': 'NPK 15:15:15 + Urea', 'basal': '150 kg/ha',
                 'topdress1': '100 kg/ha Urea at 3 weeks', 'topdress2': '50 kg/ha Urea at 6 weeks'},
        'Groundnuts': {'type': 'NPK (P & K focused)', 'basal': '50 kg/ha',
                       'topdress1': 'Optional 20 kg/ha', 'topdress2': 'N/A'},
        'Beans': {'type': 'NPK 15:15:15', 'basal': '60 kg/ha',
                  'topdress1': 'Optional 20 kg/ha', 'topdress2': 'N/A'}
    }

    if crop == 'Maize':
        variety_types = {
            'OPV': ['Kanyani', 'SC 403', 'MH 18', 'MH 19', 'MH 20'],
            'Hybrid': ['DK 8031', 'DK 8053', 'SC 627'],
            'Local': ['Chitedze', 'Mwanza', 'Kalima']
        }
        for v_type, varieties in variety_types.items():
            if variety in varieties:
                return plans['Maize'].get(v_type, plans['Maize']['OPV'])

    return plans.get(crop, plans['Maize']['OPV'])

# ===================================================================
# ENDPOINTS
# ===================================================================

@app.get("/")
async def root():
    return {
        "message": "AgriSmart Backend API is running",
        "version": "1.0.0",
        "models_loaded": vectorizer is not None and tfidf_matrix is not None,
        "pest_entries": len(pest_data)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Backend is running",
        "models_loaded": vectorizer is not None and tfidf_matrix is not None,
        "pest_database_size": len(pest_data)
    }

@app.get("/weather")
async def get_weather(lat: float, lon: float):
    """Fetch weather data from WeatherAPI"""
    try:
        location_query = f"{lat},{lon}"
        url = f"http://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY}&q={location_query}&days=5&aqi=no&alerts=no"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
        
        if "error" in data:
            raise Exception(data["error"]["message"])
        
        mapped = {
            "current": {
                "location": data["location"]["name"],
                "temp": data["current"]["temp_c"],
                "condition": data["current"]["condition"]["text"],
                "humidity": data["current"]["humidity"],
                "wind": data["current"]["wind_kph"],
            },
            "hourly": [
                {"time": h["time"].split(" ")[1], "temp": h["temp_c"], "condition": h["condition"]["text"]}
                for h in data["forecast"]["forecastday"][0]["hour"]
            ],
            "daily": [
                {
                    "day": d["date"],
                    "temp": d["day"]["avgtemp_c"],
                    "condition": d["day"]["condition"]["text"],
                }
                for d in data["forecast"]["forecastday"]
            ],
        }
        
        return mapped
    except Exception as e:
        print(f"Weather API error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/diagnose")
async def diagnose_pest(query: str):
    """Diagnose pest/disease from farmer's description"""
    
    if vectorizer is None or tfidf_matrix is None:
        return {
            "error": "ML models not loaded",
            "query": query,
            "results": []
        }
    
    preprocessed_query = preprocess_query(query)
    
    if not preprocessed_query or len(preprocessed_query.strip()) == 0:
        return {
            "error": "Query is empty after preprocessing",
            "query": query,
            "results": []
        }
    
    try:
        query_vec = vectorizer.transform([preprocessed_query])
    except Exception as e:
        return {
            "error": f"Vectorization failed: {str(e)}",
            "query": query,
            "results": []
        }
    
    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    related_docs_indices = cosine_similarities.argsort()[:-6:-1]
    
    results = []
    for idx in related_docs_indices:
        score = float(cosine_similarities[idx])
        
        if score > 0.05:
            pest = pest_data[idx].copy()
            
            pest['similarity_score'] = round(score, 4)
            pest['confidence_level'] = get_confidence(score)
            pest['key_symptoms_sample'] = pest.get('key_symptoms', [])[:3]
            pest['crop'] = pest.get('crop', 'Unknown')
            
            results.append(pest)
    
    return {
        "query": query,
        "total_matches": len(results),
        "results": results[:3]
    }

@app.post("/predict-yield")
async def predict_yield_endpoint(request: YieldPredictionRequest):
    """Predict crop yield"""
    try:
        yield_data = predict_yield(request)
        maturity_days = get_variety_maturity(request.crop, request.variety)
        
        plant_date = datetime.strptime(request.planting_date, "%Y-%m-%d")
        harvest_date = plant_date + timedelta(days=maturity_days)
        
        fert_plan = get_fertilizer_plan(request.crop, request.variety)
        
        prices = {'Maize': 250000, 'Rice': 400000, 'Groundnuts': 350000, 'Beans': 300000}
        price_per_ton = prices.get(request.crop, 250000)
        
        estimated_revenue = yield_data['total_yield_tonnes'] * price_per_ton
        estimated_cost = 350000 * (request.land_size_acres * 0.404686)
        estimated_profit = estimated_revenue - estimated_cost
        
        return {
            "success": True,
            "prediction": {
                "yield_per_ha": yield_data['yield_per_ha'],
                "total_yield_tonnes": yield_data['total_yield_tonnes'],
                "maturity_days": maturity_days,
                "harvest_date": harvest_date.strftime("%Y-%m-%d")
            },
            "planting_window": {
                "status": "good",
                "message": "Excellent planting time!"
            },
            "fertilizer_plan": fert_plan,
            "financial": {
                "estimated_revenue": estimated_revenue,
                "estimated_cost": estimated_cost,
                "estimated_profit": estimated_profit,
                "price_per_ton": price_per_ton
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/feedback")
async def save_feedback(diagnosis: str, is_correct: bool):
    """Save feedback for model improvement"""
    feedback_log = {
        "diagnosis": diagnosis,
        "is_correct": is_correct,
        "timestamp": str(datetime.now())
    }
    
    try:
        with open('feedback_log.jsonl', 'a') as f:
            f.write(json.dumps(feedback_log) + '\n')
        return {"status": "feedback saved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
