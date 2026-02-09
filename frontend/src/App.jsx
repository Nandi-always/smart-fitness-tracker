import React, { useState } from 'react';
import axios from 'axios';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkoutTracking from './pages/WorkoutTracking';
import NutritionTracking from './pages/NutritionTracking';
import AICoach from './pages/AICoach';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProfileSetup from './components/ProfileSetup';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    localStorage.setItem('fit_auth', 'true');
    try {
      // Check if user has already set up their profile
      const res = await axios.get('/api/user/profile');
      const hasSetup = localStorage.getItem('fit_setup_done');

      // Only show if not done in this browser and name is default or missing
      if (!hasSetup && (!res.data.name || res.data.name === 'Monika')) {
        setShowProfileSetup(true);
      } else {
        setShowProfileSetup(false);
      }
    } catch (e) {
      setShowProfileSetup(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowProfileSetup(false);
    localStorage.removeItem('fit_auth');
    localStorage.removeItem('fit_setup_done');
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    localStorage.setItem('fit_setup_done', 'true');
  };

  // Re-hydrate auth on refresh
  React.useEffect(() => {
    const hydrateAuth = async () => {
      if (localStorage.getItem('fit_auth') === 'true') {
        setIsAuthenticated(true);
        try {
          const res = await axios.get('/api/user/profile');
          const hasSetup = localStorage.getItem('fit_setup_done');
          if (!hasSetup && (!res.data.name || res.data.name === 'Monika')) {
            setShowProfileSetup(true);
          }
        } catch (e) {
          console.warn("Profile check failed on hydrate", e);
        }
      }
    };
    hydrateAuth();
  }, []);

  return (
    <Router>
      <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-cult-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
        {isAuthenticated && <Sidebar />}
        {isAuthenticated && showProfileSetup && (
          <ProfileSetup onComplete={handleProfileComplete} />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {isAuthenticated && <Navbar onLogout={handleLogout} />}

          <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 transition-colors duration-300 ${isDarkMode ? 'bg-cult-dark' : 'bg-gray-50'}`}>
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/workouts" element={isAuthenticated ? <WorkoutTracking /> : <Navigate to="/login" />} />
              <Route path="/nutrition" element={isAuthenticated ? <NutritionTracking /> : <Navigate to="/login" />} />
              <Route path="/reminders" element={isAuthenticated ? <Reminders /> : <Navigate to="/login" />} />
              <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
