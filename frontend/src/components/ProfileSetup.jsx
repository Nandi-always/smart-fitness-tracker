import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Ruler, Weight, Target, ArrowRight, Zap, Utensils, Activity, ChevronRight, Check } from 'lucide-react';
import axios from 'axios';

const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 1.375, label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 1.55, label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    { value: 1.725, label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 1.9, label: 'Super Active', desc: 'Very hard exercise & physical job' }
];

const DIETS = [
    { value: 'Non-Veg', label: 'Non-Vegetarian' },
    { value: 'Veg', label: 'Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Egg', label: 'Eggitarian' }
];

const ProfileSetup = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: 'Female',
        height: '',
        weight: '',
        activityLevel: 1.2,
        goal: 'Maintain',
        diet: 'Non-Veg'
    });

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await axios.get('/api/user/profile');
                if (res.data.name) {
                    setForm(prev => ({ ...prev, ...res.data }));
                }
            } catch (err) { }
        };
        fetchExisting();
    }, []);

    const calculateBMI = () => {
        if (!form.height || !form.weight) return null;
        const hM = form.height / 100;
        const bmi = (form.weight / (hM * hM)).toFixed(1);
        let status = { label: 'Normal', color: 'text-green-500' };
        if (bmi < 18.5) status = { label: 'Underweight', color: 'text-blue-400' };
        if (bmi >= 25) status = { label: 'Overweight', color: 'text-orange-400' };
        if (bmi >= 30) status = { label: 'Obese', color: 'text-red-500' };
        return { bmi, ...status };
    };

    const bmiData = calculateBMI();

    const handleSubmit = async () => {
        try {
            await axios.post('/api/user/profile', form);
            onComplete(form);
        } catch (err) {
            console.error("Setup failed", err);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const renderStepIndicator = () => (
        <div className="flex justify-between mb-8 px-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step >= i ? 'bg-cult-green text-black scale-110' : 'bg-white/10 text-gray-500'}`}>
                        {step > i ? <Check className="w-4 h-4" /> : i}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#15171e] w-full max-w-lg rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-white/80">Profile Setup</h2>
                        {onClose && (
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                <ChevronRight className="w-5 h-5 rotate-180" /> Back
                            </button>
                        )}
                    </div>
                    {renderStepIndicator()}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white">Who are you?</h3>
                                    <p className="text-gray-400 text-sm">Basic details to enforce your identity.</p>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-cult-green focus:outline-none transition-colors"
                                        placeholder="Full Name"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            value={form.age}
                                            onChange={e => setForm({ ...form, age: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cult-green focus:outline-none"
                                            placeholder="Age"
                                        />
                                        <select
                                            value={form.gender}
                                            onChange={e => setForm({ ...form, gender: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cult-green focus:outline-none appearance-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={nextStep} disabled={!form.name || !form.age} className="w-full bg-cult-green text-black font-bold py-4 rounded-xl mt-4 disabled:opacity-50 hover:bg-white transition-colors">
                                    Next Step
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white">Body Stats</h3>
                                    <p className="text-gray-400 text-sm">This calculates your metabolic rate.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Height (cm)</label>
                                        <input type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white focus:border-cult-green focus:outline-none" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Weight (kg)</label>
                                        <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white focus:border-cult-green focus:outline-none" placeholder="0" />
                                    </div>
                                </div>
                                {bmiData && (
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Your BMI</p>
                                            <p className={`text-2xl font-black ${bmiData.color}`}>{bmiData.bmi}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg bg-black/30 font-bold text-sm ${bmiData.color}`}>
                                            {bmiData.label}
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={prevStep} className="flex-1 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10">Back</button>
                                    <button onClick={nextStep} disabled={!form.height || !form.weight} className="flex-[2] bg-cult-green text-black font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-white">Next Step</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-4">
                                    <h3 className="text-2xl font-black text-white">Activity Level</h3>
                                    <p className="text-gray-400 text-sm">How active are you on a daily basis?</p>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {ACTIVITY_LEVELS.map(level => (
                                        <div
                                            key={level.value}
                                            onClick={() => setForm({ ...form, activityLevel: level.value })}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${form.activityLevel === level.value ? 'bg-cult-green/10 border-cult-green' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div>
                                                <p className={`font-bold ${form.activityLevel === level.value ? 'text-white' : 'text-gray-300'}`}>{level.label}</p>
                                                <p className="text-xs text-gray-500">{level.desc}</p>
                                            </div>
                                            {form.activityLevel === level.value && <Activity className="w-5 h-5 text-cult-green" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={prevStep} className="flex-1 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10">Back</button>
                                    <button onClick={nextStep} className="flex-[2] bg-cult-green text-black font-bold py-4 rounded-xl hover:bg-white">Next Step</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white">Final Details</h3>
                                    <p className="text-gray-400 text-sm">Refine your plan.</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Primary Goal</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Lose', 'Maintain', 'Gain'].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => setForm({ ...form, goal: g })}
                                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${form.goal === g ? 'bg-cult-green border-cult-green text-black' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Dietary Preference</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DIETS.map(d => (
                                                <button
                                                    key={d.value}
                                                    onClick={() => setForm({ ...form, diet: d.value })}
                                                    className={`p-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center space-x-2 ${form.diet === d.value ? 'bg-cult-blue/20 border-cult-blue text-cult-blue' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                                >
                                                    {form.diet === d.value && <Utensils className="w-3 h-3" />}
                                                    <span>{d.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={prevStep} className="flex-1 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10">Back</button>
                                    <button onClick={handleSubmit} className="flex-[2] bg-gradient-to-r from-cult-green to-emerald-400 text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-cult-green/20">
                                        COMPLETE PROFILE
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileSetup;
