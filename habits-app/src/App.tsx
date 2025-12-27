import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { StatusPage } from './components/StatusPage';
import { AdminTicketsView } from './components/AdminTicketsView';
import { Home, Settings as SettingsIcon, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'jonas@jonasinfocus.com';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

type ViewType = 'dashboard' | 'settings' | 'admin';

const AppLayout = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user) return null;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return isAdmin ? <AdminTicketsView /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-2"
        style={{
          background: 'linear-gradient(to top, rgba(11, 11, 11, 0.98), rgba(11, 11, 11, 0.9), transparent)',
        }}
      >
        <div
          className="max-w-[400px] mx-auto flex items-center justify-around rounded-2xl py-3 px-6"
          style={{
            background: 'rgba(28, 28, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <NavButton
            icon={<Home size={22} />}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />

          {isAdmin && (
            <NavButton
              icon={<Shield size={22} />}
              label="Admin"
              isActive={currentView === 'admin'}
              onClick={() => setCurrentView('admin')}
            />
          )}

          <NavButton
            icon={<SettingsIcon size={22} />}
            label="Settings"
            isActive={currentView === 'settings'}
            onClick={() => setCurrentView('settings')}
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 px-4 py-1 transition-all"
    style={{
      color: isActive ? '#3b82f6' : '#6F6F6F',
    }}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

function LandingPageRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <LandingPage />;
}

function LoginRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage />;
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPageRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
