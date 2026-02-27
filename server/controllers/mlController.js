const SoilData = require('../models/SoilData');
const axios = require('axios');

const getCropRecommendation = async (req, res) => {
    const { N_level, P_level, K_level, pH_value, moisture, temperature, rainfall } = req.body;
    try {
        // Save the input data
        const soilData = await SoilData.create({
            userId: req.user._id,
            N_level, P_level, K_level, pH_value, moisture
        });

        // Prepare data for Python Microservice
        const payload = {
            N: parseFloat(N_level) || 0,
            P: parseFloat(P_level) || 0,
            K: parseFloat(K_level) || 0,
            temperature: parseFloat(temperature) || 25.0,
            humidity: parseFloat(moisture) || 0,
            ph: parseFloat(pH_value) || 0,
            rainfall: parseFloat(rainfall) || 200.0
        };

        // Call the Python FastAPI microservice
        const pythonApiRes = await axios.post('http://127.0.0.1:8000/predict_crop', payload);

        if (!pythonApiRes.data.success) {
            throw new Error(pythonApiRes.data.message || 'Failed to get prediction from ML server');
        }

        const recommendations = pythonApiRes.data.recommendations.map(rec => ({
            name: rec.name,
            match: Math.round(rec.confidence)
        }));

        res.json({
            success: true,
            recommendedCrops: recommendations,
            soilDataId: soilData._id
        });
    } catch (error) {
        console.error("ML Prediction Error:", error.message);
        res.status(500).json({ success: false, message: 'Crop recommendation failed. Is the Python ML server running?' });
    }
};

const detectDisease = async (req, res) => {
    // In a real scenario, handle actual image upload (multer) and send to python ML model.
    try {
        // Mock ML output
        res.json({
            success: true,
            detectedDisease: 'Early Blight',
            confidenceScore: 0.92,
            suggestedAction: 'Apply Copper Oxychloride at 2g/L'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getCropRecommendation, detectDisease };
