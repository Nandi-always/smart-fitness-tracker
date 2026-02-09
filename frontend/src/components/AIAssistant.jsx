import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const AIAssistant = () => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Fitness Coach. How can I help you today? You can ask me for nutrition info, exercise tips based on your mood, or a motivational quote!' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post('/api/ai/chat', { query: input });
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
                setIsTyping(false);
            }, 1000);
        } catch (err) {
            console.error("AI Assistant Error:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!" }]);
            setIsTyping(false);
        }
    };

    const suggestions = [
        "How much protein in chicken?",
        "I'm feeling stressed",
        "Give me motivation",
        "Explain TDEE"
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        className={`w-[400px] h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4 border ${isDarkMode ? 'bg-[#1b1f23]/95 border-white/10' : 'bg-white/95 border-gray-200'} backdrop-blur-xl`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-cult-green/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cult-green rounded-xl flex items-center justify-center">
                                    <Bot className="text-black w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fitness AI Coach</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-cult-green rounded-full animate-pulse" />
                                        <span className="text-[10px] text-cult-green font-bold uppercase tracking-wider">Online & Ready</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`p-2 rounded-full hover:bg-white/5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                            ? 'bg-cult-green text-black font-medium rounded-tr-none shadow-lg shadow-cult-green/10'
                                            : (isDarkMode ? 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none' : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none shadow-sm')
                                        }`}>
                                        <div className="prose prose-invert max-w-none">
                                            {msg.content.split('\n').map((line, i) => {
                                                if (line.startsWith('### ')) {
                                                    return <h4 key={i} className="text-cult-green font-bold mt-2 mb-1 uppercase text-[10px] tracking-widest">{line.replace('### ', '')}</h4>
                                                }
                                                if (line.startsWith('• ')) {
                                                    return <div key={i} className="flex gap-2 ml-1 mb-1"><span className="text-cult-green">•</span>{line.replace('• ', '')}</div>
                                                }
                                                if (line.startsWith('> ')) {
                                                    return <blockquote key={i} className="border-l-2 border-cult-green pl-3 italic my-2 text-xs opacity-80">{line.replace('>', '')}</blockquote>
                                                }
                                                return <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className={`p-4 rounded-2xl rounded-tl-none flex gap-1 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-100'}`}>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer / Input */}
                        <div className="p-6 border-t border-white/10 space-y-4">
                            {!messages.some(m => m.role === 'user') && (
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(s); handleSend(); }}
                                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 hover:bg-cult-green hover:text-black hover:border-cult-green transition-all uppercase tracking-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className={`flex-1 bg-transparent border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cult-green transition-all ${isDarkMode ? 'border-white/10 text-white placeholder:text-gray-600' : 'border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-cult-green p-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-black"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-cult-green rounded-2xl shadow-2xl flex items-center justify-center group relative"
            >
                {isOpen ? (
                    <X className="text-black w-8 h-8" />
                ) : (
                    <>
                        <Bot className="text-black w-8 h-8" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-4 border-black animate-ping" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-4 border-black" />
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
