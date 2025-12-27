import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, CheckCircle } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultToSignup = searchParams.get('mode') === 'signup';
  const [isLogin, setIsLogin] = useState(!defaultToSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/app');
      } else {
        if (!termsAccepted) {
          setError('Please accept the Terms of Service to continue');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: name,
              display_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;

        setShowSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in');
      } else if (message.includes('already registered') || message.includes('already been registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col selection:bg-[#3b82f6]/30">
      {/* Header */}
      <nav className="max-w-[1200px] w-full mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] text-[#F5F5F5] hover:opacity-80 transition-opacity"
        >
          Sentra
        </button>
        <div className="flex items-center gap-2 text-[13px] text-[#6F6F6F]">
          <Shield size={14} />
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
              {isLogin ? 'Access your support dashboard.' : 'Get premium Apple tech support.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Name field - only show for signup */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="text-metadata block mb-2 opacity-60">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  placeholder="Your name"
                  required={!isLogin}
                />
              </motion.div>
            )}

            <div>
              <label className="text-metadata block mb-2 opacity-60">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#3b82f6] transition-colors"
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
                className="w-full px-0 py-3 bg-transparent border-b border-[#181818] text-[#F5F5F5] text-[15px] focus:outline-none focus:border-[#3b82f6] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Terms checkbox - only show for signup */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-2"
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: termsAccepted ? '#3b82f6' : '#3A3A3A',
                        backgroundColor: termsAccepted ? '#3b82f6' : 'transparent',
                      }}
                    >
                      {termsAccepted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] text-[#6F6F6F] group-hover:text-[#A0A0A0] transition-colors">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#3b82f6] hover:text-[#60a5fa] underline transition-colors"
                    >
                      Terms of Service
                    </a>
                  </span>
                </label>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-[#ef4444] font-medium"
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
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[13px] text-[#6F6F6F] hover:text-[#A0A0A0] transition-colors"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-[1200px] w-full mx-auto px-6 py-8 border-t border-[#181818]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[12px] text-[#4F4F4F]">
            <Shield size={12} />
            <span>Your data is secure and private</span>
          </div>
          <div className="flex gap-8 text-[12px] text-[#4F4F4F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#6F6F6F] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#6F6F6F] transition-colors">Terms</button>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[420px] p-8 rounded-3xl"
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <CheckCircle size={32} className="text-[#22c55e]" />
                </motion.div>

                <h2 className="text-[22px] font-semibold text-[#F5F5F5] mb-3 tracking-tight">
                  Check Your Email
                </h2>

                <p className="text-[14px] text-[#A0A0A0] mb-6 leading-relaxed">
                  We sent a verification link to<br />
                  <span className="text-[#F5F5F5] font-medium">{email}</span>
                </p>

                <div
                  className="flex items-center justify-center gap-3 p-4 rounded-xl mb-6"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Mail size={18} className="text-[#3b82f6]" />
                  <span className="text-[13px] text-[#6F6F6F]">
                    Click the link in your email to activate your account
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                    setName('');
                    setTermsAccepted(false);
                  }}
                  className="w-full py-4 rounded-xl text-[15px] font-medium transition-all bg-white text-black hover:bg-white/90"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
