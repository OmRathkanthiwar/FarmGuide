import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, Loader2, Leaf } from 'lucide-react';
import api from '../services/api';

function AgriBot() {
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hello! I am Agri-Bot, your dedicated 24/7 agricultural intelligence assistant. I can analyze soil data, diagnose pest symptoms, explain market trends, or help you maximize your crop yield. How can I help your farm today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatText = (text) => {
        return text.replace(/\*\*/g, '').replace(/\*/g, '•').split('\n').map((line, i) => (
            <span key={i} className="block mb-1">{line}</span>
        ));
    };

    const handleSend = async (e, customText = null) => {
        e?.preventDefault();
        const textToSubmit = customText || input;
        
        if (!textToSubmit.trim() || loading) return;

        const newMessages = [...messages, { role: 'user', text: textToSubmit }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { 
                message: textToSubmit,
                history: messages.slice(1).map(m => ({ role: m.role, text: m.text }))
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'model', text: res.data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my knowledge base right now. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Communication error: The AI server is currently unreachable." }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "What are the best organic treatments for Tomato Late Blight?",
        "How much fertilizer should I use for 2 acres of Wheat?",
        "Explain the PM-Kisan subsidy eligibility in simple terms.",
        "What is the current market trend analysis for Cotton?"
    ];

    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
            
            {/* Main Chat Interface */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden relative border-rose-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50 flex items-center gap-4 bg-slate-900/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-900/20">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">Agri-Bot Intelligence <Sparkles size={16} className="text-orange-400"/></h2>
                        <p className="text-xs text-rose-200/70 font-medium tracking-wide">POWERED BY GOOGLE GEMINI 2.5 FLASH</p>
                    </div>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl p-4 flex gap-4 shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-900/20' 
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-slate-900'
                            }`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
                                        <Bot size={16} className="text-rose-400" />
                                    </div>
                                )}
                                
                                <div className="text-[15px] leading-relaxed">
                                    {formatText(msg.text)}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex-shrink-0 flex items-center justify-center border border-emerald-500">
                                        <User size={16} className="text-emerald-200" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 rounded-tl-sm flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                    <Loader2 size={16} className="text-orange-400 animate-spin" />
                                </div>
                                <span className="text-slate-400 text-sm font-medium animate-pulse">Analyzing agricultural data...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-md">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about crops, diseases, markets, or soil..."
                            disabled={loading}
                            className="w-full bg-slate-800 text-white rounded-xl py-4 pl-6 pr-16 border border-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-500 disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Sidebar Details Pane */}
            <div className="hidden lg:flex w-80 flex-col gap-6">
                <div className="glass-panel p-6 border-rose-500/20 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="text-orange-400" size={20}/> Suggested Queries
                    </h3>
                    <div className="space-y-3 flex-1">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(null, s)}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 transition-all group"
                            >
                                <p className="text-sm text-slate-300 group-hover:text-rose-200 font-medium leading-relaxed">{s}</p>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="glass-panel p-6 border-emerald-500/20 bg-emerald-900/10">
                    <div className="flex items-center gap-3 mb-2">
                         <Leaf className="text-emerald-400" size={20}/>
                         <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Expert Guidance</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Agri-Bot has active context concerning standard Indian agricultural standards, crop cycles, and the specific intelligence tools within your smart dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AgriBot;
