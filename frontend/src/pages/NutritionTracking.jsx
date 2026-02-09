import React, { useState } from 'react';
import { Search, Plus, Trash2, PieChart, X, Calculator, Leaf, Beef, Heart, ShieldCheck, Activity } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const getFoodType = (name) => {
    const nonVegKeywords = ['chicken', 'beef', 'pork', 'fish', 'egg', 'meat', 'lamb', 'tuna', 'salmon', 'bacon', 'mutton'];
    const lowerName = name.toLowerCase();
    return nonVegKeywords.some(kw => lowerName.includes(kw)) ? 'Non-Veg' : 'Veg';
};

const AddFoodModal = ({ isOpen, onClose, onConfirm, foodItem }) => {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !foodItem) return null;

    // Calculate totals
    const totalCals = Math.round(foodItem.cals * quantity);
    const totalP = Math.round(foodItem.p * quantity);
    const totalC = Math.round(foodItem.c * quantity);
    const totalF = Math.round(foodItem.f * quantity);
    const type = getFoodType(foodItem.name);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ ...foodItem, cals: totalCals, p: totalP, c: totalC, f: totalF, quantity, type });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1c1e26] border border-white/10 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cult-green to-transparent opacity-20"></div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10">
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${type === 'Veg' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`}></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{foodItem.name}</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Benefits Section */}
                    {(foodItem.benefits || foodItem.control) && (
                        <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
                            {foodItem.benefits && (
                                <div className="flex items-start space-x-3">
                                    <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Health Benefit</p>
                                        <p className="text-sm text-gray-200">{foodItem.benefits}</p>
                                    </div>
                                </div>
                            )}
                            {foodItem.control && (
                                <div className="flex items-start space-x-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Good For</p>
                                        <p className="text-sm text-gray-200">{foodItem.control}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Quantity</label>
                        <div className="flex items-center space-x-4 mt-2">
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                className="w-24 bg-black/20 border border-white/10 rounded-xl p-3 text-center text-white focus:outline-none focus:border-cult-green font-bold text-lg"
                            />
                            <div className="text-sm text-gray-400">
                                <p>1 Serving = {foodItem.cals} kcal</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Cals</span>
                            <span className="font-black text-white">{totalCals}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Prot</span>
                            <span className="font-black text-blue-400">{totalP}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Carbs</span>
                            <span className="font-black text-orange-400">{totalC}g</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Fats</span>
                            <span className="font-black text-yellow-400">{totalF}g</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-cult-green hover:bg-white text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-cult-green/10 flex items-center justify-center uppercase tracking-widest text-sm">
                        <Plus className="w-5 h-5 mr-2" />
                        Add to Daily Log
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const NutritionTracking = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [log, setLog] = useState([]);
    const [user, setUser] = useState(null);
    const [dietFilter, setDietFilter] = useState('All'); // All, Veg, Non-Veg

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);

    // --- Fetch Data ---
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [logRes, userRes] = await Promise.all([
                    axios.get('/api/nutrition'),
                    axios.get('/api/user/profile')
                ]);
                setLog(logRes.data.log || []);
                setUser(userRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    // --- Dynamic Goal Calculation ---
    const calculateGoals = () => {
        if (!user || user.weight <= 0 || user.height <= 0 || user.age <= 0) {
            return { calories: 2000, protein: 150, carbs: 200 };
        }

        // Simple Mifflin-St Jeor Equation (Approximate)
        let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
        bmr = user.gender === 'Male' ? bmr + 5 : bmr - 161;

        // Multiply by activity factor
        let tdee = bmr * (user.activity_level || 1.2);

        // Adjust based on goal
        if (user.goal === 'Lose') tdee -= 500;
        if (user.goal === 'Gain') tdee += 500;

        // Safety floor to prevent negative or dangerously low values
        const finalCalories = Math.max(1200, Math.round(tdee));

        return {
            calories: finalCalories,
            protein: Math.round(finalCalories * 0.30 / 4), // 30% protein
            carbs: Math.round(finalCalories * 0.45 / 4)    // 45% carbs
        };
    };

    const GOALS = calculateGoals();

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 0) {
            try {
                // Real API Call gets full objects now
                const res = await axios.get(`/api/search/food?q=${val}`);
                setResults(res.data.results || []);
            } catch (err) {
                setResults([]);
            }
        } else {
            setResults([]);
        }
    };

    const handleFoodSelect = (foodItem) => {
        // Use the API data directly
        setSelectedFood(foodItem);
        setIsModalOpen(true);
        setResults([]);
        setQuery('');
    };

    const confirmAddFood = async (finalItem) => {
        try {
            await axios.post('/api/nutrition', finalItem);
            setLog([...log, finalItem]);
            setIsModalOpen(false);
            setSelectedFood(null);
        } catch (err) {
            console.error("Failed to add food", err);
        }
    };

    const removeFood = async (index) => {
        try {
            await axios.delete(`/api/nutrition/${index}`);
            const newLog = [...log];
            newLog.splice(index, 1);
            setLog(newLog);
        } catch (err) {
            console.error("Failed to remove food", err);
        }
    }

    // --- Dynamic Totals ---
    const totals = log.reduce((acc, curr) => ({
        calories: acc.calories + (curr.cals || 0),
        protein: acc.protein + (curr.p || 0),
        carbs: acc.carbs + (curr.c || 0)
    }), { calories: 0, protein: 0, carbs: 0 });

    const calsLeft = Math.max(0, GOALS.calories - totals.calories);
    const calsPercentage = (totals.calories / GOALS.calories) * 100;
    const proteinPercentage = (totals.protein / GOALS.protein) * 100;
    const carbsPercentage = (totals.carbs / GOALS.carbs) * 100;

    // Filter Logic (on client side results which are now objects)
    const filteredResults = results.filter(item => {
        if (dietFilter === 'All') return true;
        const type = getFoodType(item.name);
        return type === dietFilter;
    });

    return (
        <PageTransition>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Left: Search & Log */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Nutrition Log</h2>
                            <p className="text-gray-400">Track your macros. Fuel your body.</p>
                        </div>
                        {/* Diet Filter Toggle */}
                        <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                            {['All', 'Veg', 'Non-Veg'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setDietFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${dietFilter === f ? 'bg-cult-green text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {f === 'Veg' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    {f === 'Non-Veg' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                    <span>{f}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-20">
                        <Search className="absolute left-5 top-4 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            placeholder="Search food (e.g., Dal, Chicken, Paneer)..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 font-medium focus:outline-none focus:border-cult-green focus:bg-white/10 transition-all shadow-inner"
                        />
                        <AnimatePresence>
                            {query.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute mt-3 w-full bg-[#1c1e26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                                >
                                    {filteredResults.length > 0 ? (
                                        filteredResults.map((item, i) => {
                                            const type = getFoodType(item.name);
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => handleFoodSelect(item)}
                                                    className="p-3 hover:bg-white/5 rounded-xl cursor-pointer flex justify-between items-center group transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full ${type === 'Veg' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`}></div>
                                                        <span className="font-medium text-gray-200 group-hover:text-white">{item.name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-xs text-cult-green font-mono">{item.cals} cal</span>
                                                        <Plus className="w-5 h-5 text-gray-500 group-hover:text-cult-green" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">No {dietFilter} foods found.</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {log.map((item, i) => {
                                const type = getFoodType(item.name);
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between items-center hover:border-white/20 transition-all group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="bg-white/5 p-3 rounded-xl text-orange-400">
                                                    <PieChart className="w-6 h-6" />
                                                </div>
                                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1c1e26] ${type === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <div className="flex space-x-3 text-xs text-gray-400 mt-1 uppercase tracking-wide font-bold">
                                                    <span>{item.cals} kcal</span>
                                                    <span className="text-blue-400">P: {item.p}g</span>
                                                    <span className="text-orange-400">C: {item.c}g</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFood(i)} className="text-gray-600 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Analytics Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/5 p-8 rounded-3xl h-fit sticky top-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Daily Intake</h3>
                        {/* Daily Summary Diet Indicator */}
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                    </div>

                    <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                            <motion.circle
                                initial={{ strokeDashoffset: 502 }}
                                animate={{ strokeDashoffset: 502 - (502 * Math.min(1, totals.calories / GOALS.calories)) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="96" cy="96" r="80"
                                stroke="#D2FF44" strokeWidth="12" fill="transparent"
                                strokeDasharray="502" strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="block text-4xl font-black text-white">{calsLeft}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">kcal left</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400 font-medium">Protein</span>
                                <span className="font-bold text-white">{totals.protein}g / {GOALS.protein}g</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, proteinPercentage)}%` }}
                                    transition={{ duration: 1 }}
                                    className="bg-cult-blue h-full"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400 font-medium">Carbs</span>
                                <span className="font-bold text-white">{totals.carbs}g / {GOALS.carbs}g</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, carbsPercentage)}%` }}
                                    transition={{ duration: 1 }}
                                    className="bg-cult-orange h-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AddFoodModal
                        isOpen={isModalOpen}
                        foodItem={selectedFood}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={confirmAddFood}
                    />
                )}
            </AnimatePresence>
        </PageTransition>
    );
};

export default NutritionTracking;
