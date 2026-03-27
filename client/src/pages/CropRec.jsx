import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

function CropRec() {
    const [formData, setFormData] = useState({ N_level: '', P_level: '', K_level: '', pH_value: '', moisture: '', temperature: '', rainfall: '' });
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/ml/crop-recommendation', formData);
            // Simulate network delay for premium feel
            setTimeout(() => {
                setRecommendations(res.data.recommendedCrops);
                setLoading(false);
            }, 1200);
        } catch (err) {
            alert('Error fetching recommendation');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <header className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Crop Recommendation</h2>
                <p className="text-slate-400 text-lg">Input your soil context to receive AI-driven planting strategies.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-start">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-8 relative overflow-hidden"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Soil Parameters</h3>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Nitrogen (N)</label>
                                <input name="N_level" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Phosphorus (P)</label>
                                <input name="P_level" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Potassium (K)</label>
                                <input name="K_level" type="number" onChange={handleChange} required className="input-field" placeholder="mg/kg" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">pH Level</label>
                                <input name="pH_value" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="0 - 14" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Temperature</label>
                                <input name="temperature" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="°C" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Rainfall</label>
                                <input name="rainfall" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="mm" />
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Humidity</label>
                                <input name="moisture" type="number" step="0.1" onChange={handleChange} required className="input-field" placeholder="%" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || recommendations !== null} className="w-full btn-primary text-lg mt-8 flex justify-center items-center">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Analyze Terrain'}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4">Calculations powered by Deep Learning Classification Models</p>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {recommendations && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="glass-panel p-8 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-emerald-500 rounded-full p-1 border-4 border-emerald-500/20">
                                    <CheckCircle2 size={24} className="text-slate-900" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Top Recommendations</h3>
                            </div>

                            <div className="space-y-4 relative">
                                <div className="absolute left-4 top-4 bottom-4 w-px bg-emerald-500/20" />

                                {recommendations.map((rec, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        key={idx}
                                        className="relative pl-10"
                                    >
                                        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex justify-between items-center group hover:bg-slate-700/60 transition-colors">
                                            <span className="text-lg font-bold text-white tracking-wide capitalize">{rec.name || rec}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-emerald-400">{rec.match || 98}% Match</span>
                                                <div className="w-24 h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${rec.match || 98}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={() => setRecommendations(null)}
                                className="w-full mt-8 py-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20"
                            >
                                Start New Analysis
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default CropRec;
