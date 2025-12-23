import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { TermsModal } from './TermsModal';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      // Login flow - no terms needed
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/app');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        if (message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Signup flow - show terms first
      setShowTermsModal(true);
    }
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      navigate('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      if (message.includes('already registered')) {
        setError('An account with this email already exists');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col selection:bg-[#E85D4F]/30">
      {/* Header */}
      <nav className="max-w-[1200px] w-full mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] text-[#F5F5F5] hover:opacity-80 transition-opacity"
        >
          Habits
        </button>
        <div className="flex items-center gap-2 text-[13px] text-[#6F6F6F]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secure login</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
        <div className="text-center mb-12">
          <h1 className="text-[24px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-[14px] text-[#A0A0A0]">
            {isLogin ? 'Enter your details to continue.' : 'Start tracking your habits today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="text-metadata block mb-2 opacity-60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#E85D4F] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-[#E85D4F] font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full disabled:opacity-50"
            >
              {loading ? 'Processing' : (isLogin ? 'Continue' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[13px] text-[#6F6F6F] hover:text-[#A0A0A0] transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-[1200px] w-full mx-auto px-6 py-8 border-t border-[#181818]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[12px] text-[#4F4F4F]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Your data is isolated and protected</span>
          </div>
          <div className="flex gap-8 text-[12px] text-[#4F4F4F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#6F6F6F] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#6F6F6F] transition-colors">Terms</button>
          </div>
        </div>
      </footer>

      {/* Terms Modal for Signup */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </div>
  );
};
