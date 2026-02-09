import React, { useState, useEffect } from 'react';
import { Flame, Footprints, Timer, TrendingUp, ChevronRight, PieChart, Bell, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import { useTheme } from '../context/ThemeContext';
import AIAssistant from '../components/AIAssistant';

const data = [
    { name: 'Mon', kcal: 2400 },
    { name: 'Tue', kcal: 1398 },
    { name: 'Wed', kcal: 2800 },
    { name: 'Thu', kcal: 3908 },
    { name: 'Fri', kcal: 4800 },
    { name: 'Sat', kcal: 3800 },
    { name: 'Sun', kcal: 4300 },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const StatCard = ({ icon: Icon, label, value, unit, color, isDarkMode }) => (
    <motion.div
        variants={item}
        whileHover={{ y: -5 }}
        className={`${isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 shadow-md hover:border-gray-200 hover:shadow-lg'} backdrop-blur-sm border p-6 rounded-2xl transition-all cursor-default group relative overflow-hidden`}
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100 duration-500`}></div>

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${color === 'green' ? 'bg-cult-green/10 text-cult-green' : color === 'blue' ? 'bg-cult-blue/10 text-cult-blue' : color === 'red' ? 'bg-red-500/10 text-red-400' : 'bg-cult-orange/10 text-cult-orange'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center">
                +2.5% <TrendingUp className="w-3 h-3 ml-1" />
            </span>
        </div>
        <div className="relative z-10">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>{label}</p>
            <h3 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {value} <span className="text-sm text-gray-500 font-normal">{unit}</span>
            </h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { isDarkMode } = useTheme();
    // Dynamic State
    const [stats, setStats] = useState({
        calories: 0,
        steps: 0,
        duration: 0,
        heartRate: 0,
        intake: 0 // Food consumed
    });
    const [user, setUser] = useState(null);
    const [plan, setPlan] = useState([
        { id: 1, text: 'Morning Yoga', completed: true },
        { id: 2, text: 'HIIT Cardio', completed: true },
        { id: 3, text: 'Protein Meal', completed: false },
        { id: 4, text: 'Meditation', completed: false },
    ]);

    const togglePlanItem = (id) => {
        setPlan(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const planProgress = Math.round((plan.filter(i => i.completed).length / plan.length) * 100);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, nutritionRes, userRes] = await Promise.all([
                    axios.get('/api/history'),
                    axios.get('/api/nutrition'),
                    axios.get('/api/user/profile')
                ]);

                const history = historyRes.data.history || [];
                const log = nutritionRes.data.log || [];
                setUser(userRes.data);

                let totalCalories = 0;
                let totalDurationMinutes = 0;

                history.forEach(item => {
                    const cal = parseInt(item.calories) || 0;
                    totalCalories += cal;
                    const durStr = item.duration || "0";
                    const dur = parseInt(durStr.replace(/\D/g, '')) || 0;
                    totalDurationMinutes += dur;
                });

                // Calculate Intake Calories
                const intakeCals = log.reduce((acc, curr) => acc + (curr.cals || 0), 0);

                const hours = Math.floor(totalDurationMinutes / 60);
                const minutes = totalDurationMinutes % 60;
                const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                setStats({
                    calories: totalCalories,
                    steps: totalDurationMinutes * 120,
                    duration: formattedDuration,
                    heartRate: totalDurationMinutes > 0 ? 124 : 72,
                    intake: intakeCals
                });

            } catch (err) {
                console.error("Dashboard fetch failed", err);
            }
        };

        fetchData();
    }, []);

    const calculateDailyTarget = () => {
        if (!user || !user.weight) return 2500;
        let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
        bmr = user.gender === 'Male' ? bmr + 5 : bmr - 161;
        let tdee = bmr * (user.activity_level || 1.2);
        if (user.goal === 'Lose') tdee -= 500;
        if (user.goal === 'Gain') tdee += 500;
        return Math.round(tdee);
    };

    const target = calculateDailyTarget();
    const intakeProgress = Math.min(100, (stats.intake / target) * 100);

    return (
        <PageTransition>
            <div className={`space-y-8 pb-10 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Today's Overview</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-cult-green/20 text-cult-green px-2 py-0.5 rounded-full font-black uppercase">
                                Goal: {user?.goal || 'Maintain'}
                            </span>
                            <span className="text-xs text-gray-500">
                                Target: {target} kcal
                            </span>
                        </div>
                    </div>
                    <button className="text-sm font-semibold text-cult-green hover:underline">View All Stats</button>
                </div>

                {/* Goal Alert Banner */}
                {stats.intake < target * 0.7 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-cult-orange/10 border border-cult-orange/20 p-4 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cult-orange/20 rounded-full flex items-center justify-center">
                                <Bell className="w-5 h-5 text-cult-orange" />
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Goal Reminder</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>You're slightly behind your intake goal. Try a healthy snack! 🍎</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.hash = '#/nutrition'}
                            className="text-xs font-black text-cult-orange uppercase bg-cult-orange/20 px-4 py-2 rounded-xl hover:bg-cult-orange hover:text-black transition-all"
                        >
                            Log Food
                        </button>
                    </motion.div>
                )}

                {/* 1. Daily Summary Stats (DYNAMIC) */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatCard icon={Flame} label="Calories Burned" value={stats.calories} unit="kcal" color="orange" isDarkMode={isDarkMode} />
                    <StatCard icon={PieChart} label="Nutrition Intake" value={stats.intake} unit={`/ ${target} kcal`} color="green" isDarkMode={isDarkMode} />
                    <StatCard icon={Footprints} label="Steps Count" value={stats.steps.toLocaleString()} unit="steps" color="blue" isDarkMode={isDarkMode} />
                    <StatCard icon={Timer} label="Workout Duration" value={stats.duration} unit="" color="green" isDarkMode={isDarkMode} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Weekly Performance Graph */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`lg:col-span-2 border p-8 rounded-3xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-md'}`}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Activity Performance</h3>
                            <select className={`border rounded-lg px-3 py-1 text-sm focus:outline-none transition-colors ${isDarkMode ? 'bg-black/20 text-white border-white/10' : 'bg-gray-50 text-gray-900 border-gray-200'}`}>
                                <option>This Week</option>
                                <option>Last Week</option>
                            </select>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D2FF44" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D2FF44" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDarkMode ? '#1c1e26' : '#fff', border: isDarkMode ? '1px solid #333' : '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#D2FF44', fontWeight: 'bold' }}
                                        cursor={{ stroke: isDarkMode ? '#333' : '#e5e7eb', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="kcal"
                                        stroke="#D2FF44"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorKcal)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* 3. Today's Plan / Progress (Dynamic Progress) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`border p-8 rounded-3xl flex flex-col justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-md'}`}
                    >
                        <div>
                            <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Today's Plan</h3>
                            <div className="space-y-3">
                                {plan.map((item, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        key={item.id}
                                        onClick={() => togglePlanItem(item.id)}
                                        className={`flex items-center p-4 rounded-xl transition-all cursor-pointer group border ${item.completed ? 'bg-cult-green/10 border-cult-green' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center border-2 transition-colors ${item.completed ? 'bg-cult-green border-cult-green' : (isDarkMode ? 'border-gray-600 group-hover:border-cult-green' : 'border-gray-300 group-hover:border-cult-green')}`}>
                                            {item.completed && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors flex-1 ${item.completed ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-600 group-hover:text-black')}`}>
                                            {item.text}
                                        </span>
                                        {item.completed && (
                                            <span className="text-[10px] font-bold bg-cult-green/20 text-cult-green px-2 py-1 rounded uppercase tracking-wider">
                                                Done
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-sm font-medium text-gray-400">Daily Goal</h4>
                                <span className="text-2xl font-bold text-cult-green">{planProgress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${planProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-cult-green to-emerald-500 h-full rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <AIAssistant />
            </div>
        </PageTransition>
    );
};

export default Dashboard;
