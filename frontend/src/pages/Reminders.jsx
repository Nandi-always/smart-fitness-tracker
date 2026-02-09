import React, { useState, useEffect } from 'react';
import { Bell, Clock, Youtube, Plus, Trash2, Zap, Layers, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PageTransition from '../components/PageTransition';

const Reminders = () => {
    const [reminders, setReminders] = useState([]); // Max Heap (Priority)
    const [historyStack, setHistoryStack] = useState([]); // Stack (LIFO History)

    const [newReminder, setNewReminder] = useState("");
    const [priority, setPriority] = useState(5);

    // Auto-Link Generator
    const generateLink = (activity) => {
        const workoutKeywords = ['pushup', 'squat', 'yoga', 'run', 'cardio', 'workout', 'stretch', 'plank', 'bench', 'deadlift', 'gym'];
        const isWorkout = workoutKeywords.some(w => activity.toLowerCase().includes(w));

        if (isWorkout) {
            return `https://www.youtube.com/results?search_query=${encodeURIComponent(activity + " tutorial")}`;
        }
        return "";
    };

    // Fetch Data on Load (Fixing "Vanished" issue)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Heap
                const resHeap = await axios.get('/api/reminders');
                if (resHeap.data.all_reminders) {
                    const mapped = resHeap.data.all_reminders.map((item, i) => ({
                        id: i, // Simple index ID for display
                        priority: item[0],
                        text: item[1],
                        link: generateLink(item[1]),
                        type: generateLink(item[1]) ? "Workout" : "General"
                    }));
                    setReminders(mapped);
                }

                // Fetch Stack
                const resStack = await axios.get('/api/undo/all');
                if (resStack.data.stack) {
                    setHistoryStack(resStack.data.stack);
                }
            } catch (err) {
                console.error("Backend connection failed", err);
            }
        };
        fetchData();
    }, []);

    const addReminder = async (e) => {
        e.preventDefault();
        if (!newReminder) return;

        const link = generateLink(newReminder);

        // 1. Add to Heap (Backend)
        try {
            await axios.post('/api/reminders', { message: newReminder, priority: parseInt(priority) });

            // 2. Add to Stack (Backend - "Store in Stack" request)
            await axios.post('/api/undo/push', { action: `Added: ${newReminder}`, time: new Date().toLocaleTimeString() });

            // Refresh UI
            // Optimistic Update
            const newItem = { id: Date.now(), priority: parseInt(priority), text: newReminder, link: link, type: link ? "Workout" : "General" };
            const updatedHeap = [...reminders, newItem].sort((a, b) => b.priority - a.priority);
            setReminders(updatedHeap);

            setHistoryStack([{ action: `Added: ${newReminder}`, time: new Date().toLocaleTimeString() }, ...historyStack]);
            setNewReminder("");

        } catch (err) {
            alert("Failed to save. Is backend running?");
        }
    };

    const handleUndo = async () => {
        try {
            const res = await axios.post('/api/undo/pop');
            if (res.data.undone) {
                // Remove top item (LIFO - index 0)
                const newStack = [...historyStack];
                newStack.shift();
                setHistoryStack(newStack);
            } else {
                alert("Nothing to undo!");
            }
        } catch (err) {
            console.error("Undo failed", err);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto pb-10">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Smart Reminders & History</h2>
                        <p className="text-gray-400">Manage your tasks with Priority (Heap) and History (Stack).</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: Input Section */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-[#1c1e26] border border-white/10 p-6 rounded-3xl">
                            <h3 className="font-bold text-xl mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-cult-green" />
                                New Exercise / Task
                            </h3>
                            <form onSubmit={addReminder} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Activity Name</label>
                                    <input
                                        type="text"
                                        value={newReminder}
                                        onChange={(e) => setNewReminder(e.target.value)}
                                        placeholder="e.g. Do 20 Pushups"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cult-green mt-1"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1 ml-1">*YouTube links auto-attach</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Priority (1-10)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full mt-2 accent-cult-green h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Low</span>
                                        <span className="text-cult-green font-bold">{priority}</span>
                                        <span>Urgent</span>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-cult-green hover:bg-white text-black font-bold py-3 rounded-xl transition-all shadow-lg border border-transparent">
                                    Add Reminder
                                </button>
                            </form>
                        </div>

                        {/* STACK VISUALIZATION (User Requested) */}
                        <div className="bg-[#1c1e26] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center text-cult-blue">
                                    <Layers className="w-5 h-5 mr-2" />
                                    History (Stack)
                                </h3>
                                <button
                                    onClick={handleUndo}
                                    className="text-[10px] bg-cult-blue/10 text-cult-blue px-2 py-1 rounded border border-cult-blue/20 hover:bg-cult-blue hover:text-white transition-colors flex items-center"
                                >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Undo Last
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {historyStack.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-black/40 border-l-2 border-cult-blue p-3 rounded-r-lg text-sm"
                                        >
                                            <p className="text-gray-300 truncate">
                                                {item.action === 'ADD_WORKOUT' && item.data
                                                    ? `Added Workout: ${item.data.title}`
                                                    : (item.action?.message || item.action || "Action")}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1 font-mono">
                                                {item.time || "Just now"}
                                            </p>
                                        </motion.div>
                                    ))}
                                    {historyStack.length === 0 && <p className="text-gray-600 text-sm text-center italic py-4">History is empty.</p>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Heap Visualization (Reminders) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Upcoming Tasks</span>
                            <span className="text-xs normal-case text-gray-500">Priority Sorted</span>
                        </h3>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {reminders.map((r, i) => (
                                    <motion.div
                                        key={i} // Using index as ID since heap returns just list
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`p-5 rounded-2xl border flex items-center justify-between group relative overflow-hidden ${i === 0 ? 'bg-gradient-to-r from-cult-green/10 to-transparent border-cult-green/30' : 'bg-white/5 border-white/5'}`}
                                    >
                                        <div className="flex items-center space-x-4 relative z-10 w-full">
                                            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-cult-green text-black' : 'bg-white/10 text-gray-400'}`}>
                                                {r.priority}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-lg truncate ${i === 0 ? 'text-white' : 'text-gray-300'}`}>{r.text}</h4>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="text-xs text-gray-500 bg-black/20 px-2 py-0.5 rounded text-transform uppercase whitespace-nowrap">{r.type}</span>
                                                    {r.link && (
                                                        <a href={r.link} target="_blank" rel="noreferrer" className="flex items-center text-xs text-red-400 hover:text-red-300 hover:underline whitespace-nowrap">
                                                            <Youtube className="w-3 h-3 mr-1" />
                                                            Watch Tutorial
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {i === 0 && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <span className="flex items-center text-xs font-bold text-cult-green animate-pulse bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                                    <Zap className="w-3 h-3 mr-1" /> NEXT
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {reminders.length === 0 && (
                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-400">No active priorities.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Reminders;
