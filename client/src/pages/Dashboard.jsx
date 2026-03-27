import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Bug, TrendingUp, CloudRain, ChevronRight, Activity, AlertCircle, Droplets, Landmark } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const [trendData, setTrendData] = useState([]);
    const [trendMetrics, setTrendMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const { data } = await api.get('/market/trend?crop=wheat');
                if (data.success) {
                    setTrendData(data.data.chart_data);
                    setTrendMetrics({
                        volatility: data.data.volatility_status,
                        recommendation: data.data.recommendation,
                        current: data.data.current_price,
                        sma: data.data.sma
                    });
                }
            } catch (error) {
                console.error("Failed to load trend data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrend();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold tracking-tight text-white mb-2"
                    >
                        Welcome back, {user?.fullName?.split(' ')[0]}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Here's what's happening on your farm right now.
                    </motion.p>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                <Link to="/crop-rec">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Sprout size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Crop Recs</h3>
                        <p className="text-sm text-slate-400">Get AI-driven crop suggestions based on active soil data.</p>
                    </motion.div>
                </Link>

                <Link to="/disease-detect">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                                <Bug size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Disease Detect</h3>
                        <p className="text-sm text-slate-400">Scan leaves to instantly identify health issues.</p>
                    </motion.div>
                </Link>

                <Link to="/market-prices">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Market Insights</h3>
                        <p className="text-sm text-slate-400">Live API integration with local mandi commodity prices.</p>
                    </motion.div>
                </Link>

                <Link to="/weather">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-sky-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                                <CloudRain size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Weather</h3>
                        <p className="text-sm text-slate-400">Hyper-local forecasting & conditions.</p>
                    </motion.div>
                </Link>

                <Link to="/profit">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-yellow-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Profit Calc</h3>
                        <p className="text-sm text-slate-400">AI-powered farm financial estimations.</p>
                    </motion.div>
                </Link>

                <Link to="/irrigation">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <Droplets size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Irrigation</h3>
                        <p className="text-sm text-slate-400">Smart water management and daily scheduling.</p>
                    </motion.div>
                </Link>

                <Link to="/schemes">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-purple-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Landmark size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Govt Schemes</h3>
                        <p className="text-sm text-slate-400">Browse eligible agricultural grants and policies.</p>
                    </motion.div>
                </Link>

                <Link to="/fertilizer">
                    <motion.div variants={itemVariants} className="glass-card p-6 cursor-pointer group h-full hover:border-pink-500/30 hover:bg-slate-800/80 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                <Activity size={24} />
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Fertilizer Calc</h3>
                        <p className="text-sm text-slate-400">Compute required Urea and DAP based on NPK soil data.</p>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-8"
            >
                {loading || !trendMetrics ? (
                    <div className="h-72 w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    Wheat Price Volatility
                                    {trendMetrics.volatility === 'Stable' ? (
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20 flex items-center gap-1">
                                            <Activity size={12} /> Stable
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20 flex items-center gap-1">
                                            <AlertCircle size={12} /> Fluctuating
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-400">7-Day Simple Moving Average (SMA: ₹{trendMetrics.sma})</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`text-sm font-semibold mb-1 ${trendMetrics.recommendation.includes('sell') ? 'text-emerald-400' :
                                        trendMetrics.recommendation.includes('Hold') ? 'text-amber-400' : 'text-blue-400'
                                    }`}>
                                    {trendMetrics.recommendation}
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    ₹{trendMetrics.current} <span className="text-sm text-slate-400 font-normal">/ quintal</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={trendMetrics.volatility === 'Stable' ? "#10B981" : "#F59E0B"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={trendMetrics.volatility === 'Stable' ? "#10B981" : "#F59E0B"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: trendMetrics.volatility === 'Stable' ? '#34D399' : '#FBBF24', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke={trendMetrics.volatility === 'Stable' ? "#10B981" : "#F59E0B"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default Dashboard;
