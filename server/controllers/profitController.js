const axios = require('axios');

// Hardcoded static cost components for advanced simulation since we don't have a DB for this yet.
// These are typical costs per acre (in USD for example purposes).
const CROP_COSTS = {
    'rice': { seeds: 50, fertilizer: 120, pesticides: 40, labor: 200, irrigation: 80, misc: 50 },
    'wheat': { seeds: 40, fertilizer: 100, pesticides: 30, labor: 150, irrigation: 60, misc: 40 },
    'maize': { seeds: 60, fertilizer: 110, pesticides: 35, labor: 160, irrigation: 50, misc: 45 },
    'sugarcane': { seeds: 200, fertilizer: 250, pesticides: 80, labor: 400, irrigation: 150, misc: 100 },
    'cotton': { seeds: 80, fertilizer: 130, pesticides: 120, labor: 250, irrigation: 70, misc: 60 },
    'tomato': { seeds: 150, fertilizer: 180, pesticides: 90, labor: 300, irrigation: 100, misc: 70 },
    'potato': { seeds: 120, fertilizer: 160, pesticides: 80, labor: 220, irrigation: 90, misc: 60 }
};

const getCropCost = (crop) => {
    const defaultCost = { seeds: 50, fertilizer: 100, pesticides: 50, labor: 150, irrigation: 50, misc: 50 };
    return CROP_COSTS[crop.toLowerCase()] || defaultCost;
};

const calculateProfit = async (req, res) => {
    try {
        const { crop, area, location, rainfall, pesticides_tonnes, avg_temp } = req.body;

        if (!crop || !area || !location || !rainfall || !pesticides_tonnes || !avg_temp) {
            return res.status(400).json({ success: false, message: 'Please provide all required parameters.' });
        }

        const areaNum = parseFloat(area);

        // 1. Get Predicted Yield from Python ML Service
        let predictedYieldPerAcre = 2.5; // fallback
        try {
            const yieldRes = await axios.post('http://127.0.0.1:8000/predict_yield', {
                Area: location,
                Item: crop,
                average_rain_fall_mm_per_year: parseFloat(rainfall),
                pesticides_tonnes: parseFloat(pesticides_tonnes),
                avg_temp: parseFloat(avg_temp)
            });
            if (yieldRes.data.success) {
                // Return value is hectograms per hectare. 
                // 1 hg = 0.1 kg. 1 hectare = 2.47 acres
                // hg/ha to tons/acre = (value * 0.1 / 1000) / 2.47
                const hg_ha = yieldRes.data.predicted_yield_tons_per_acre;
                predictedYieldPerAcre = (hg_ha * 0.0001) / 2.47;
            }
        } catch (e) {
            console.warn("Failed to reach ML yield service, using fallback:", e.message);
        }

        const totalYieldTons = predictedYieldPerAcre * areaNum;

        // 2. Get Predicted Selling Price SMA from Python ML Service
        let pricePerTon = 20000; // fallback INR
        try {
            const priceRes = await axios.post('http://127.0.0.1:8000/predict_price', { crop });
            if (priceRes.data.success) {
                pricePerTon = priceRes.data.predicted_price_per_ton;
            }
        } catch (e) {
            console.warn("Failed to reach ML price service, using fallback:", e.message);
        }

        // 3. Get Predicted Cost of Cultivation from Python ML Service
        let costPerAcreINR = 33600; // fallback INR
        try {
            const costRes = await axios.post('http://127.0.0.1:8000/predict_cost', {
                crop: crop,
                state: location
            });
            if (costRes.data.success) {
                costPerAcreINR = costRes.data.predicted_cost_per_acre;
            }
        } catch (e) {
            console.warn("Failed to reach ML cost service, using fallback:", e.message);
        }

        const totalCostSub = costPerAcreINR * areaNum;

        // Statistically distribute the predicted ML total cost into realistic farming ratios
        const costBreakdown = {
            seeds: totalCostSub * 0.12,
            fertilizer: totalCostSub * 0.18,
            pesticides: totalCostSub * 0.08,
            labor: totalCostSub * 0.40,
            irrigation: totalCostSub * 0.12,
            misc: totalCostSub * 0.10
        };

        const totalRevenue = totalYieldTons * pricePerTon;
        const netProfit = totalRevenue - totalCostSub;
        const breakEvenPrice = totalCostSub / totalYieldTons;
        const profitMargin = (netProfit / totalRevenue) * 100;

        // 4. AI-Driven Weather & Volatility Risk Engine (0 - 100)
        let totalRiskScore = 30; // fallback rating
        try {
            const riskRes = await axios.post('http://127.0.0.1:8000/predict_risk', {
                state: location,
                rainfall: parseFloat(rainfall),
                pesticides: parseFloat(pesticides_tonnes),
                crop: crop
            });
            if (riskRes.data.success) {
                totalRiskScore = riskRes.data.riskScore;
            }
        } catch (e) {
            console.warn("Failed to reach ML risk service, using fallback:", e.message);
        }

        let profitabilityCategory = 'Low';
        if (profitMargin > 40) profitabilityCategory = 'High';
        else if (profitMargin > 15) profitabilityCategory = 'Moderate';
        else if (profitMargin < 0) profitabilityCategory = 'Loss Risk';

        // 5. Sensitivity Analysis Simulation (Matrix)
        const sensitivityScenarios = [];
        const variations = [-15, -10, 0, 10, 15];

        for (let yieldVar of variations) {
            for (let priceVar of variations) {
                // To keep it simple for a chart, we just change one axis or both proportionally.
                // Let's just generate a 1D scenario curve for Recharts based on Price Variance taking Yield Variance as fixed segments.
                // Actually, let's create a flat array for the chart combining both vectors (e.g. "P-10% Y-10%", "Expected", "P+10% Y+10%")
            }
        }

        // Simpler 1D Sensitivity for easy charting: "What if Price & Yield both drop/rise?"
        const chartData = [
            { scenario: 'Worst Case (-15%)', yield: totalYieldTons * 0.85, price: pricePerTon * 0.85, profit: ((totalYieldTons * 0.85) * (pricePerTon * 0.85)) - totalCostSub },
            { scenario: 'Bad (-10%)', yield: totalYieldTons * 0.90, price: pricePerTon * 0.90, profit: ((totalYieldTons * 0.90) * (pricePerTon * 0.90)) - totalCostSub },
            { scenario: 'Expected', yield: totalYieldTons, price: pricePerTon, profit: netProfit },
            { scenario: 'Good (+10%)', yield: totalYieldTons * 1.10, price: pricePerTon * 1.10, profit: ((totalYieldTons * 1.10) * (pricePerTon * 1.10)) - totalCostSub },
            { scenario: 'Best Case (+15%)', yield: totalYieldTons * 1.15, price: pricePerTon * 1.15, profit: ((totalYieldTons * 1.15) * (pricePerTon * 1.15)) - totalCostSub },
        ];


        const financialData = {
            predictedYieldTons: totalYieldTons,
            predictedYieldPerAcre: predictedYieldPerAcre,
            predictedPricePerTon: pricePerTon,
            totalCost: totalCostSub,
            costBreakdown: costBreakdown,
            expectedRevenue: totalRevenue,
            netProfit: netProfit,
            breakEvenPrice: breakEvenPrice,
            profitMargin: profitMargin,
            riskScore: totalRiskScore,
            profitabilityCategory: profitabilityCategory,
            sensitivityAnalysis: chartData
        };

        res.json({ success: true, data: financialData });

    } catch (error) {
        console.error("Advanced Profit Controller Error:", error);
        res.status(500).json({ success: false, message: 'Failed to calculate expected profit intelligence.' });
    }
};

module.exports = { calculateProfit };
