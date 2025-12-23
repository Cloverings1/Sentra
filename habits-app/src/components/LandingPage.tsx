import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiamondSpots } from '../hooks/useDiamondSpots';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { spotsRemaining, loading: spotsLoading } = useDiamondSpots();

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Start building the habit.',
      features: [
        'Up to 3 habits',
        'Daily & Weekly views',
        'Core tracking'
      ],
      buttonText: 'Get Started',
      tier: 'free' as const
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For serious habit builders.',
      features: [
        'Unlimited habits',
        'Insights over time',
        'Cloud sync across devices',
        'Priority support'
      ],
      buttonText: 'Go Pro',
      tier: 'pro' as const
    },
    {
      name: 'Diamond',
      price: '$0',
      period: '/forever',
      badge: spotsRemaining > 0 ? `${spotsRemaining}/5 left` : 'Sold out',
      description: 'Founding member. Lifetime access.',
      features: [
        'Everything in Pro',
        'Lifetime access - forever free',
        'Founding member status',
        'Early access to new features',
        'Direct line to the founder'
      ],
      buttonText: spotsRemaining > 0 ? 'Claim Your Spot' : 'Join Waitlist',
      tier: 'diamond' as const
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto px-6 py-10 flex justify-between items-center">
        <div className="text-[18px] font-semibold tracking-[-0.01em]">
          Habits
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/login')}
            className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-pill-primary !py-2 !px-6 !text-[14px]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Founding Member Banner */}
      <AnimatePresence>
        {spotsRemaining > 0 && !spotsLoading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1200px] mx-auto px-6"
          >
            <div
              className="flex items-center justify-center gap-3 py-3 px-6 rounded-full mx-auto w-fit"
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#06b6d4' }}
              />
              <span className="text-[13px]" style={{ color: '#06b6d4' }}>
                <span className="font-semibold">{spotsRemaining} of 5</span>
                <span className="text-[#06b6d4]/70"> founding member spots remaining</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 pt-24 pb-48 text-center sm:text-left">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-metadata mb-6"
        >
          Daily Consistency
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-hero mb-8 max-w-[600px]"
        >
          Master your routines. <br />
          Built for daily dependability.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#A0A0A0] text-[16px] max-w-[480px] mb-12 leading-relaxed"
        >
          The interface is intentional and restrained. <br />
          Helping you focus on what matters most.
        </motion.p>
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="flex flex-col sm:flex-row items-center gap-6"
        >
            <button
              onClick={() => navigate('/login')}
              className="btn-pill-primary"
            >
              Start Tracking
            </button>
            <div className="flex items-center gap-2 text-[13px] text-[#6F6F6F]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Private & encrypted</span>
            </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-32 bg-[#141414]/30">
        <div className="mb-24">
          <p className="text-metadata mb-4">Pricing</p>
          <h2 className="text-section-header">Simple and calm.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-[1100px]">
          {pricingPlans.map((plan, index) => {
            const isDiamond = plan.tier === 'diamond';
            const isPro = plan.tier === 'pro';
            const diamondAvailable = isDiamond && spotsRemaining > 0;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Diamond tier glow effect */}
                {isDiamond && (
                  <div
                    className="absolute -inset-[1px] rounded-[32px] opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-80"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                    }}
                  />
                )}

                <div
                  className="relative p-8 rounded-[32px] transition-transform duration-300 hover:translate-y-[-4px] h-full flex flex-col"
                  style={{
                    background: isDiamond
                      ? 'linear-gradient(180deg, #141414 0%, #0c1a1d 100%)'
                      : '#141414',
                    border: isDiamond ? '1px solid rgba(6, 182, 212, 0.3)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3
                          className="text-[12px] font-medium tracking-[0.08em] uppercase"
                          style={{ color: isDiamond ? '#06b6d4' : '#6F6F6F' }}
                        >
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <motion.span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isDiamond
                                ? spotsRemaining > 0
                                  ? 'rgba(6, 182, 212, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(34, 197, 94, 0.15)',
                              color: isDiamond
                                ? spotsRemaining > 0
                                  ? '#06b6d4'
                                  : '#ef4444'
                                : '#22c55e',
                            }}
                            animate={isDiamond && spotsRemaining > 0 ? {
                              boxShadow: [
                                '0 0 0 0 rgba(6, 182, 212, 0)',
                                '0 0 0 4px rgba(6, 182, 212, 0.1)',
                                '0 0 0 0 rgba(6, 182, 212, 0)',
                              ],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {plan.badge}
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-baseline">
                        <span
                          className="text-[32px] font-semibold"
                          style={{ color: isDiamond ? '#06b6d4' : '#F5F5F5' }}
                        >
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-[#6F6F6F] ml-1 text-[14px]">{plan.period}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#A0A0A0] text-[15px] mb-10 leading-snug">
                    {plan.description}
                  </p>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center text-[14px] text-[#A0A0A0]">
                        <div
                          className="w-1.5 h-1.5 rounded-full mr-3 opacity-60"
                          style={{ backgroundColor: isDiamond ? '#06b6d4' : '#E85D4F' }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 px-6 rounded-full text-[14px] font-medium transition-all duration-200"
                    style={
                      isDiamond
                        ? diamondAvailable
                          ? {
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              color: '#0B0B0B',
                              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: '#6F6F6F',
                            }
                        : isPro
                          ? {
                              background: '#F5F5F5',
                              color: '#0B0B0B',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: '#A0A0A0',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }
                    }
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="max-w-[1200px] mx-auto px-6 py-24 border-t border-[#181818]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[14px] text-[#6F6F6F]">
            Quietly building since 2025.
          </div>
          <div className="flex gap-12 text-[14px] text-[#6F6F6F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#A0A0A0] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#A0A0A0] transition-colors">Terms</button>
            <button onClick={() => navigate('/changelog')} className="hover:text-[#A0A0A0] transition-colors">Changelog</button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-[#181818]/50 text-[12px] text-[#4F4F4F]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Your data is isolated and protected with row-level security</span>
        </div>
      </footer>
    </div>
  );
};
