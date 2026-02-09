import React, { useState } from 'react';
import axios from 'axios';
import { Play, Clock, Flame, Calendar, ChevronRight, Plus, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const WorkoutCard = ({ title, duration, calories, difficulty, videoUrl, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-cult-green/50 transition-all group cursor-pointer shadow-lg relative"
    >
        <div className="h-48 bg-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            {/* Placeholder Gradient as Image */}
            <div className={`absolute inset-0 bg-gradient-to-br ${index % 3 === 0 ? 'from-orange-500/20 to-red-500/20' : index % 3 === 1 ? 'from-blue-500/20 to-purple-500/20' : 'from-green-500/20 to-emerald-500/20'}`}></div>

            <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold z-20 backdrop-blur-md ${difficulty === 'Hard' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-cult-green/20 text-cult-green border border-cult-green/20'}`}>
                {difficulty}
            </span>

            <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold mb-1">{title}</h3>
                <p className="text-sm text-gray-300 flex items-center font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> {duration}
                    <span className="mx-2">•</span>
                    <Flame className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> {calories} kcal
                </p>
            </div>
        </div>
        <div className="p-5 flex justify-between items-center bg-white/[0.02]">
            <span className="text-gray-400 text-sm font-medium flex items-center">
                {videoUrl ? <span className="text-blue-400 flex items-center"><Video className="w-3 h-3 mr-1" /> Video Linked</span> : "Target: Full Body"}
            </span>
            <button
                onClick={() => videoUrl && window.open(videoUrl, '_blank')}
                className={`p-3 rounded-full transition-all group-hover:scale-110 ${videoUrl ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white/10 hover:bg-cult-green hover:text-black'}`}
            >
                <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
        </div>
    </motion.div>
);

const AddWorkoutModal = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({ title: '', duration: '', calories: '', difficulty: 'Medium', videoUrl: '' });
    const [status, setStatus] = useState(null); // 'matching', 'found', 'searching'
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [bundleSuggestions, setBundleSuggestions] = useState([]);

    // --- Live Matching Logic ---
    React.useEffect(() => {
        if (!form.title) {
            setStatus(null);
            setSearchSuggestions([]);
            setBundleSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            // Clear old link when starting a new search
            setForm(prev => ({ ...prev, videoUrl: '' }));
            try {
                // 1. Fetch Prefix Suggestions (Trie)
                const searchRes = await axios.get(`/api/search/exercise?q=${form.title}`);
                setSearchSuggestions(searchRes.data.results || []);

                // 2. Fetch Link
                const linkRes = await axios.get(`/api/exercise/link?name=${form.title}`);
                if (linkRes.data.link) {
                    setForm(prev => ({ ...prev, videoUrl: linkRes.data.link }));
                    
                    if (linkRes.data.fallback) {
                        setStatus('found');
                    } else {
                        const matchInfo = linkRes.data.suggestion || linkRes.data.matched_keyword || linkRes.data.matched_via;
                        setStatus(matchInfo ? `Found: ${matchInfo}` : 'found');
                    }
                } else {
                    setStatus('searching');
                }

                // 3. Fetch Bundle (Graph Suggestions)
                const bundleRes = await axios.get(`/api/exercise/bundle?name=${form.title}`);
                setBundleSuggestions(bundleRes.data.bundle || []);
            } catch (e) {
                console.error("Live match failed", e);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.title]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Auto-fetch link if still empty or searching
        let finalForm = { ...form };
        if (!finalForm.videoUrl || status === 'searching') {
            try {
                setStatus('searching');
                const res = await axios.get(`/api/exercise/link?name=${finalForm.title}`);
                if (res.data.link) finalForm.videoUrl = res.data.link;
                setStatus('found');
            } catch (err) {
                console.warn("Auto-suggestion failed", err);
            }
        }

        await onAdd(finalForm);
        setForm({ title: '', duration: '', calories: '', difficulty: 'Medium', videoUrl: '' });
        setStatus(null);
        setSearchSuggestions([]);
        setBundleSuggestions([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1c1e26] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <h3 className="text-2xl font-bold mb-6">Create Workout</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Title</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cult-green text-white"
                            placeholder="e.g. Morning Cardio"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />

                        {/* Trie Search Suggestions */}
                        <AnimatePresence>
                            {searchSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute z-30 mt-1 w-full bg-[#252833] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto"
                                >
                                    {searchSuggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setForm({ ...form, title: s });
                                                setSearchSuggestions([]);
                                            }}
                                            className="p-3 hover:bg-white/5 cursor-pointer text-sm font-medium border-b border-white/5 last:border-0"
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI Suggestions (Graph) */}
                        <AnimatePresence>
                            {bundleSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 overflow-hidden"
                                >
                                    <p className="text-[10px] text-cult-green font-bold uppercase mb-2 tracking-widest px-1">You might also like</p>
                                    <div className="flex flex-wrap gap-2">
                                        {bundleSuggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setForm({ ...form, title: s })}
                                                className="text-xs bg-white/5 hover:bg-cult-green hover:text-black border border-white/10 px-3 py-1.5 rounded-full transition-all text-gray-300"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Duration</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cult-green text-white"
                                placeholder="e.g. 20 min"
                                value={form.duration}
                                onChange={e => setForm({ ...form, duration: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Calories</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cult-green text-white"
                                placeholder="e.g. 300"
                                value={form.calories}
                                onChange={e => setForm({ ...form, calories: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Video Link fetching status (Hidden from user input) */}
                    <div className="flex justify-start items-center space-x-2 h-4">
                        {status && status !== 'searching' && (
                            <span className="text-[10px] bg-cult-green/20 text-cult-green px-2 py-0.5 rounded-full font-black animate-pulse flex items-center">
                                <Video className="w-3 h-3 mr-1" /> {status.toUpperCase()} LINKED
                            </span>
                        )}
                        {status === 'searching' && (
                            <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-bold flex items-center">
                                <Video className="w-3 h-3 mr-1" /> FETCHING BEST LINK...
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Difficulty</label>
                        <div className="flex bg-black/20 rounded-xl p-1 mt-1">
                            {['Easy', 'Medium', 'Hard'].map(d => (
                                <button
                                    type="button"
                                    key={d}
                                    onClick={() => setForm({ ...form, difficulty: d })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.difficulty === d ? 'bg-cult-green text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-cult-green text-black font-bold py-4 rounded-xl hover:bg-white transition-colors mt-4">
                        ADD WORKOUT
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const WorkoutTracking = () => {
    const [activeTab, setActiveTab] = useState('plan');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workouts, setWorkouts] = useState([
        { title: "HIIT Tabata", duration: "20 min", calories: "320", difficulty: "Hard", videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI" },
        { title: "Power Yoga", duration: "45 min", calories: "210", difficulty: "Medium", videoUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE" },
        { title: "Core Blast", duration: "15 min", calories: "150", difficulty: "Medium", videoUrl: "https://www.youtube.com/watch?v=1fGCPW1Yx-s" }
    ]);
    const [history, setHistory] = useState([]);

    // Load History
    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/history');
                setHistory(res.data.history || []);
            } catch (e) {
                console.error("Failed to fetch history", e);
            }
        };
        fetchHistory();
    }, [activeTab]);

    const addNewWorkout = async (newWorkout) => {
        try {
            // 1. Update UI immediately (Optimistic)
            setWorkouts([newWorkout, ...workouts]);

            // 2. Upload to Server
            await axios.post('/api/history', newWorkout);

            // 3. Optional: Trigger undo stack on server
            await axios.post('/api/undo/push', { action: 'ADD_WORKOUT', data: newWorkout, time: new Date().toLocaleTimeString() });
        } catch (e) {
            console.error("Upload failed", e);
        }
    };

    return (
        <PageTransition>
            <div className="space-y-8 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Workout Zone</h2>
                        <p className="text-gray-400">Time to sweat. Select your session.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-cult-green text-black px-4 py-2 rounded-full font-bold flex items-center hover:bg-white transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-1" /> Add Custom
                        </button>
                        <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
                            {['plan', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-cult-green text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {tab === 'plan' ? "Today's Plan" : "History"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {activeTab === 'plan' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {workouts.map((w, i) => (
                            <WorkoutCard key={i} index={i} {...w} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {history.length > 0 ? (
                            history.map((h, i) => (
                                <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-6">
                                        <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-cult-green/20 group-hover:text-cult-green transition-colors">
                                            <Calendar className="w-6 h-6 text-gray-400 group-hover:text-cult-green" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{h.title}</h4>
                                            <p className="text-sm text-gray-400">{h.duration} • {h.calories} kcal • <span className="text-white">{new Date(h.timestamp).toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`font-bold bg-cult-green/10 px-3 py-1 rounded-full text-xs border border-cult-green/20 ${h.videoUrl ? 'text-cult-green' : 'text-gray-400'}`}>
                                            {h.videoUrl ? 'Video Attached' : 'Logged'}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500">No workout history yet. Start training!</p>
                            </div>
                        )}
                    </motion.div>
                )}

                <AnimatePresence>
                    {isModalOpen && (
                        <AddWorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addNewWorkout} />
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default WorkoutTracking;
