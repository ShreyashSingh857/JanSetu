from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List
from predict import MultiTaskPredictor

MODEL_DIR = os.getenv('MODEL_DIR', 'models/multitask-issue-classifier')

app = FastAPI(title="JanSetu NLP Inference API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None

class PredictRequest(BaseModel):
    texts: List[str]

class PredictResponseItem(BaseModel):
    urgency: str
    category: str

@app.on_event("startup")
async def load_model():
    global predictor
    predictor = MultiTaskPredictor(MODEL_DIR)

@app.get('/health')
async def health():
    return {"status": "ok"}

@app.post('/predict')
async def predict(req: PredictRequest):
    results = predictor.predict(req.texts)
    return {"results": results}

# To run: uvicorn backend.app:app --reload --port 8001
