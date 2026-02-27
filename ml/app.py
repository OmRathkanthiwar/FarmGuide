from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()

# Load the trained model
try:
    with open('crop_model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Warning: crop_model.pkl not found. Please run train_model.py first.")
    model = None

class SoilData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.post("/predict_crop")
async def predict_crop(data: SoilData):
    if model is None:
        return {"success": False, "message": "Model not loaded on server."}
    
    # Extract features in the exact order the model was trained on
    features = np.array([[
        data.N, 
        data.P, 
        data.K, 
        data.temperature, 
        data.humidity, 
        data.ph, 
        data.rainfall
    ]])

    # Get class names
    classes = model.classes_
    
    # Get probabilities for all classes
    probabilities = model.predict_proba(features)[0]
    
    # Get top 3 indices sorted by probability
    top_indices = np.argsort(probabilities)[::-1][:3]
    
    recommendations = []
    for idx in top_indices:
        recommendations.append({
            "name": str(classes[idx]),
            "confidence": float(probabilities[idx] * 100)
        })
    
    return {
        "success": True,
        "recommendations": recommendations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
