import React, { useEffect, useState } from 'react';
import { Bot, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const AICoach = () => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await axios.get('/api/recommendations/Strength');
                setRecommendations(res.data.recommendations || ['Bench Press', 'Deadlift', 'Protein Shake']);
            } catch (e) {
                setRecommendations(['Bench Press', 'Deadlift', 'Protein Shake (Fallback)']);
            }
        }
        fetchRecs();
    }, []);

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto pb-10">
                <div className="text-center mb-12">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-cult-green/20 to-emerald-500/20 mb-6 border border-cult-green/30">
                        <Bot className="w-12 h-12 text-cult-green" />
                    </div>
                    <h1 className="text-4xl font-black mb-3">AI Smart Coach</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Powered by Graph Algorithms to connect your goals with optimal exercises.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-[#1c1e26] to-black border border-white/10 p-10 rounded-[2rem] mb-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cult-green/10 blur-[100px] rounded-full"></div>

                    <h2 className="text-2xl font-bold mb-2 flex items-center z-10 relative">
                        <Sparkles className="w-6 h-6 text-cult-orange mr-3" />
                        Coach's Insight
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed z-10 relative">
                        "Based on your recent <strong className="text-white">Strength</strong> training patterns, I've detected a plateau in your chest progression. I recommend integrating compound movements and increasing protein intake for recovery."
                    </p>
                </motion.div>

                <h3 className="text-xl font-bold mb-6 flex items-center px-2">
                    <Zap className="w-5 h-5 text-cult-green mr-2" />
                    Recommended Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5, borderColor: 'rgba(210,255,68,0.5)' }}
                            className="bg-white/5 p-8 rounded-3xl border border-white/5 transition-all cursor-pointer group"
                        >
                            <h4 className="font-bold text-xl mb-2 group-hover:text-cult-green transition-colors">{rec}</h4>
                            <p className="text-sm text-gray-400">Optimized for Strength • High Impact</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
};

export default AICoach;
