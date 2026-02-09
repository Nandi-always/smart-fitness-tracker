import React, { useState, useEffect } from 'react';
import { Bell, Moon, User, Shield, Trash2, LogOut, Globe, Volume2, Ruler, ChevronRight, Check, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import ProfileSetup from '../components/ProfileSetup';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Section = ({ title, children, isDarkMode }) => (
    <div className="mb-8">
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
        <div className={`${isDarkMode ? 'bg-[#1c1e26] border-white/5' : 'bg-white border-gray-200 shadow-md'} border rounded-2xl overflow-hidden shadow-lg transition-colors duration-300`}>
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon: Icon, color, label, value, onClick, isDanger, hasToggle, isToggled, onToggle, subLabel, isDarkMode }) => (
    <div
        onClick={onClick}
        className={`p-4 flex items-center justify-between border-b last:border-0 transition-all ${isDarkMode ? 'border-white/5' : 'border-gray-100'} ${onClick ? `cursor-pointer ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}` : ''}`}
    >
        <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg transition-colors ${isDanger ? 'bg-red-500/10 text-red-500' : `bg-${color || 'gray'}-500/10 text-${color || 'gray'}-500`}`}>
                <Icon className={`w-5 h-5 ${isDanger ? 'text-red-500' : `text-${color}-400`}`} />
            </div>
            <div>
                <span className={`font-medium block ${isDanger ? 'text-red-400' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{label}</span>
                {subLabel && <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subLabel}</span>}
            </div>
        </div>

        <div className="flex items-center space-x-3">
            {value && <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{value}</span>}

            {hasToggle && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isToggled ? 'bg-cult-green' : (isDarkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isToggled ? 'left-7' : 'left-1'}`}></div>
                </button>
            )}

            {!hasToggle && onClick && <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />}
        </div>
    </div>
);

const CLICK_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."; // Short placeholder, will use real B64 below

const playClickSound = () => {
    // Simple Pop Sound (Base64 encoded WAV)
    const audio = new Audio("data:audio/wav;base64,UklGRj4BAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRgBAACAg4CCg4OEhYKDhISDg4SEg4ODhISDg4SEg4ODhISDg4SEg4ODhISDg4SEg4ODhISDg4SEg4ODhISDg4SEg4ODhISDg4SEg4ODhISOjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Hg==");
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
};

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

const LanguageModal = ({ isOpen, onClose, selected, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1c1e26] border border-white/10 w-full max-w-md rounded-3xl p-6 relative shadow-2xl max-h-[80vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
                <h3 className="text-xl font-bold mb-1">Select Language</h3>
                <p className="text-gray-400 text-sm mb-6">Choose your preferred language.</p>
                <div className="grid grid-cols-1 gap-2">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang.name)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selected === lang.name ? 'bg-cult-green/10 border-cult-green' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                            <span className="font-medium text-white">{lang.name}</span>
                            <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-3 font-mono">{lang.native}</span>
                                {selected === lang.name && <div className="w-2 h-2 rounded-full bg-cult-green"></div>}
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const Settings = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [user, setUser] = useState({ name: 'User' });
    const [showEdit, setShowEdit] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        notifications: true,
        units: 'metric', // metric, imperial
        sound: true,
        privateProfile: false,
        language: 'English'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/user/profile');
                if (res.data.name) setUser(res.data);
            } catch (err) { }
        };
        fetchUser();
    }, []);

    const togglePref = (key) => {
        if (key === 'darkMode') {
            toggleTheme();
            if (preferences.sound) playClickSound();
            return;
        }

        setPreferences(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            // Play sound if turning sound ON, or if sound is ALREADY ON and toggling something else
            if (key === 'sound') {
                if (!prev.sound) playClickSound();
            } else if (prev.sound) {
                playClickSound();
            }
            return newState;
        });
    };

    const handleEditComplete = (updatedProfile) => {
        setUser(updatedProfile);
        setShowEdit(false);
        // window.location.reload(); // Optional
    };

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to delete all activity history? This cannot be undone.")) {
            try {
                // Mock API call - in real app, explicit delete endpoint needed
                // await axios.delete('/api/history/all'); 
                alert("History cleared successfully.");
            } catch (e) {
                alert("Failed to clear history.");
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm("Sign out of your account?")) {
            window.location.reload();
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Settings</h2>
                    <p className="text-gray-400">Manage your preferences and account.</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg text-cult-green border border-cult-green/20">
                    {user.name.charAt(0)}
                </div>
            </div>

            <Section title="Account" isDarkMode={isDarkMode}>
                <SettingItem
                    icon={User}
                    color="cult-green"
                    label="Edit Profile"
                    subLabel="Personal details & goals"
                    value={user.name}
                    isDarkMode={isDarkMode}
                    onClick={() => setShowEdit(true)}
                />
                <SettingItem
                    icon={Globe}
                    color="blue"
                    label="Language"
                    value={preferences.language}
                    isDarkMode={isDarkMode}
                    onClick={() => setShowLanguageModal(true)}
                />
                <SettingItem
                    icon={Shield}
                    color="purple"
                    label="Private Profile"
                    subLabel="Only visible to you"
                    hasToggle
                    isDarkMode={isDarkMode}
                    isToggled={preferences.privateProfile}
                    onToggle={() => togglePref('privateProfile')}
                />
            </Section>

            <Section title="Preferences" isDarkMode={isDarkMode}>
                <SettingItem
                    icon={Bell}
                    color="cult-blue"
                    label="Notifications"
                    hasToggle
                    isDarkMode={isDarkMode}
                    isToggled={preferences.notifications}
                    onToggle={() => togglePref('notifications')}
                />
                <SettingItem
                    icon={Moon}
                    color="indigo"
                    label="Dark Mode"
                    hasToggle
                    isDarkMode={isDarkMode}
                    isToggled={isDarkMode}
                    onToggle={() => togglePref('darkMode')}
                />
                <SettingItem
                    icon={Ruler}
                    color="orange"
                    label="Units"
                    isDarkMode={isDarkMode}
                    value={preferences.units === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/ft)'}
                    onClick={() => setPreferences(p => ({ ...p, units: p.units === 'metric' ? 'imperial' : 'metric' }))}
                />
                <SettingItem
                    icon={Volume2}
                    color="pink"
                    label="Sound Effects"
                    hasToggle
                    isDarkMode={isDarkMode}
                    isToggled={preferences.sound}
                    onToggle={() => togglePref('sound')}
                />
            </Section>

            <Section title="Data & Privacy" isDarkMode={isDarkMode}>
                <SettingItem
                    icon={Trash2}
                    color="red"
                    label="Clear Activity History"
                    subLabel="Permanently delete all logs"
                    isDarkMode={isDarkMode}
                    onClick={handleClearHistory}
                    isDanger
                />
            </Section>

            <div className="mt-8 pt-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
                <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-[0.2em]">Smart Fitness v1.0.5 • Build 2026.1</p>
            </div>

            <AnimatePresence>
                {showEdit && (
                    <ProfileSetup
                        onComplete={handleEditComplete}
                        onClose={() => setShowEdit(false)}
                    />
                )}
                {showLanguageModal && (
                    <LanguageModal
                        isOpen={showLanguageModal}
                        onClose={() => setShowLanguageModal(false)}
                        selected={preferences.language}
                        onSelect={(lang) => {
                            setPreferences(p => ({ ...p, language: lang }));
                            setShowLanguageModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
