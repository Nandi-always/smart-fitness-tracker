import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Apple, Dumbbell } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onLogout }) => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ exercises: [], food: [], userName: '' });
    const [showResults, setShowResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const searchRef = useRef(null);
    const notificationRef = useRef(null);

    // Handle Search input & Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch User, Nutrition & Reminders
                const [userRes, nutritionRes, reminderRes] = await Promise.all([
                    axios.get('/api/user/profile'),
                    axios.get('/api/nutrition'),
                    axios.get('/api/reminders')
                ]);

                const user = userRes.data;
                setResults(prev => ({ ...prev, userName: user.name }));

                const newNotifs = [];

                // 2. Reminder Logic (Priority Heap)
                if (reminderRes.data.urgent) {
                    newNotifs.push({
                        id: 'rem-' + Date.now(),
                        title: 'Priority Task ⚡',
                        message: reminderRes.data.urgent[1],
                        type: 'urgent'
                    });
                }

                // 3. Goal Comparison Logic
                const log = nutritionRes.data.log || [];
                const intake = log.reduce((acc, curr) => acc + (curr.cals || 0), 0);

                // Calculate Target
                let target = 2500;
                if (user.weight > 0) {
                    let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
                    bmr = user.gender === 'Male' ? bmr + 5 : bmr - 161;
                    target = Math.round(bmr * (user.activity_level || 1.2));
                    if (user.goal === 'Lose') target -= 500;
                    if (user.goal === 'Gain') target += 500;
                }

                if (intake < target * 0.5) {
                    newNotifs.push({ id: 1, title: 'Keep Going! 🥗', message: `You've only consumed ${intake} kcal. Your goal is ${target} kcal.` });
                } else if (intake >= target) {
                    newNotifs.push({ id: 2, title: 'Goal Reached! 🎉', message: 'You have officially met your calorie target for today!' });
                }

                setNotifications(newNotifs);

            } catch (e) { }

            if (query.length > 0) {
                try {
                    const res = await axios.get(`/api/search/all?q=${query}`);
                    setResults(prev => ({ ...prev, exercises: res.data.exercises, food: res.data.food }));
                    setShowResults(true);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setResults(prev => ({ ...prev, exercises: [], food: [] }));
                setShowResults(false);
            }
        };

        const timer = setTimeout(fetchData, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowResults(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSelect = (type) => {
        setShowResults(false);
        setQuery('');
        if (type === 'exercise') navigate('/workouts');
        else navigate('/nutrition');
    };

    return (
        <header className={`h-20 transition-colors duration-300 border-b flex items-center justify-between px-8 z-50 relative ${isDarkMode ? 'bg-cult-dark border-white/5' : 'bg-white border-gray-100'}`}>
            {/* Left Spacer */}
            <div className="w-1/3 md:hidden"></div>

            {/* Center: Greeting */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center w-full md:w-auto">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hello, {results.userName || 'Monika'} 👋</h2>
                <p className={`text-sm hidden md:block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Let's crush your goals today!</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-6 w-full justify-end">
                <div className="relative hidden md:block group" ref={searchRef}>
                    <Search className={`absolute left-4 top-3 w-4 h-4 transition-colors ${query ? 'text-cult-green' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 0 && setShowResults(true)}
                        placeholder="Search exercises, food..."
                        className={`border rounded-full py-2.5 pl-11 pr-4 w-72 text-sm focus:outline-none focus:border-cult-green focus:ring-1 focus:ring-cult-green/30 transition-all ${isDarkMode ? 'bg-cult-card border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showResults && (results.exercises.length > 0 || results.food.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute mt-2 w-full border rounded-2xl shadow-2xl overflow-hidden p-2 z-[60] ${isDarkMode ? 'bg-[#1c1e26] border-white/10' : 'bg-white border-gray-200'}`}
                            >
                                {results.exercises.slice(0, 3).map((item, i) => (
                                    <div
                                        key={`ex-${i}`}
                                        onClick={() => handleSearchSelect('exercise')}
                                        className={`p-3 rounded-xl cursor-pointer flex items-center text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-black'}`}
                                    >
                                        <Dumbbell className="w-3 h-3 mr-2 text-cult-blue" /> {item}
                                    </div>
                                ))}
                                {results.food.slice(0, 3).map((item, i) => (
                                    <div
                                        key={`fd-${i}`}
                                        onClick={() => handleSearchSelect('food')}
                                        className={`p-3 rounded-xl cursor-pointer flex items-center text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-black'}`}
                                    >
                                        <Apple className="w-3 h-3 mr-2 text-cult-orange" /> {item}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-gray-300" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-cult-green rounded-full shadow-[0_0_10px_rgba(210,255,68,0.8)]"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute right-0 mt-4 w-80 border rounded-3xl shadow-2xl overflow-hidden z-[100] ${isDarkMode ? 'bg-[#1c1e26] border-white/10' : 'bg-white border-gray-200'}`}
                                >
                                    <div className={`p-5 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                        <h3 className={`font-bold uppercase text-xs tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Smart Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-4 border rounded-2xl transition-colors ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                                    <p className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No new alerts. You're on track!</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={onLogout}
                        className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
