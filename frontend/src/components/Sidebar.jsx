import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { isDarkMode } = useTheme();
    const [showProModal, setShowProModal] = useState(false);
    const [user, setUser] = useState({ name: 'Monika KN' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/user/profile');
                if (res.data.name) setUser(res.data);
            } catch (err) { }
        };
        fetchUser();
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Dumbbell, label: 'Workouts', path: '/workouts' },
        { icon: Utensils, label: 'Nutrition', path: '/nutrition' },
        { icon: Bell, label: 'Reminders', path: '/reminders' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            <aside className={`w-72 h-full hidden md:flex flex-col relative z-20 transition-colors duration-300 border-r ${isDarkMode ? 'bg-cult-dark border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="p-8 flex justify-center">
                    <h1 className="text-3xl font-black tracking-tighter flex items-center">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SMART</span>
                        <span className="text-cult-green ml-1">FITNESS</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'text-black font-bold'
                                    : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-cult-green shadow-[0_0_20px_rgba(210,255,68,0.4)]"></div>
                                    )}
                                    <item.icon className="w-5 h-5 relative z-10" />
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className={`p-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <div
                        onClick={() => setShowProModal(true)}
                        className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all cursor-pointer border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-gray-50 hover:bg-gray-100 border-gray-100'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cult-blue to-purple-500 flex items-center justify-center font-bold text-sm shadow-lg">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'MK'}
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name || 'Monika KN'}</p>
                            <p className="text-xs text-cult-blue font-semibold">Standard Account</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Pro Modal */}
            <AnimatePresence>
                {showProModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`${isDarkMode ? 'bg-[#1c1e26] border-white/10' : 'bg-white border-gray-200'} border p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cult-green/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-cult-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Settings className="w-10 h-10 text-cult-green animate-spin-slow" />
                                </div>
                                <h3 className={`text-2xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>App Features</h3>
                                <p className="text-gray-400 font-bold text-xs tracking-widest mt-1 uppercase">Full Access Enabled</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {[
                                    { label: 'AI Workout Bundles', desc: 'Personalized recommendations' },
                                    { label: 'Priority Reminders', desc: 'Never miss a session' },
                                    { label: 'Workout History', desc: 'Track your progress' },
                                    { label: 'Smart Goal Alerts', desc: 'AI-driven insights' }
                                ].map((item, i) => (
                                    <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowProModal(false)}
                                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-cult-green transition-colors uppercase tracking-widest"
                            >
                                CLOSE
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
