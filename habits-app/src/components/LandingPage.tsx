import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Printer, Smartphone, Laptop, HardDrive, Wifi, Shield, Clock, MessageCircle } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const oneTimeServices = [
    {
      tier: 'quick',
      name: 'Quick Fix',
      price: '$49',
      color: '#22c55e',
      description: 'Single, clearly defined issue',
      examples: [
        'Account settings',
        'App login issues',
        'Simple configuration',
        '"It worked yesterday"'
      ],
      promise: 'Fixed or refunded.'
    },
    {
      tier: 'standard',
      name: 'Standard Fix',
      price: '$99',
      color: '#3b82f6',
      description: 'Software conflicts & sync problems',
      examples: [
        'iCloud / sync issues',
        'Performance problems',
        'Printer / network setup',
        'Backup failures'
      ],
      promise: 'Resolved, stabilized, or clearly explained.'
    },
    {
      tier: 'complex',
      name: 'Complex Fix',
      price: '$199',
      color: '#ef4444',
      description: 'Multi-device & business-critical',
      examples: [
        'NAS / storage systems',
        'Data migrations',
        'Multi-device workflows',
        'Long-term performance'
      ],
      promise: 'Root cause identified and fixed.'
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Tech Peace of Mind',
      price: '$199',
      period: '/month',
      description: 'For individuals who want reliable tech support on demand.',
      features: [
        'Unlimited support tickets',
        'Async support (email/message)',
        'Priority fix scheduling',
        'All Apple devices covered'
      ],
      buttonText: 'Get Started',
      tier: 'peace_of_mind'
    },
    {
      name: 'Pro Tech Partner',
      price: '$399',
      period: '/month',
      description: 'For power users and small businesses.',
      features: [
        'Everything in Peace of Mind',
        'Faster response times',
        '1 live call per month',
        'Complex systems support',
        'Scheduling (coming soon)'
      ],
      buttonText: 'Get Started',
      tier: 'pro_partner',
      featured: true
    }
  ];

  const supportedDevices = [
    { icon: Laptop, label: 'MacBooks' },
    { icon: Monitor, label: 'iMacs' },
    { icon: Smartphone, label: 'iPhones & iPads' },
    { icon: Printer, label: 'Printers' },
    { icon: HardDrive, label: 'Storage & NAS' },
    { icon: Wifi, label: 'Networks' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#3b82f6]/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
        <div className="text-[18px] font-semibold tracking-[-0.01em]">
          Sentra
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => navigate('/login')}
            className="text-[13px] sm:text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="btn-pill-primary !py-2 !px-4 sm:!px-6 !text-[13px] sm:!text-[14px]"
          >
            Get Support
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-12 sm:pb-20 text-center sm:text-left">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-metadata mb-6"
        >
          Premium Tech Support
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[28px] sm:text-[40px] font-semibold tracking-tight leading-[1.2] mb-6 sm:mb-8 max-w-[700px] mx-auto sm:mx-0"
        >
          Expert Apple support. <br />
          Personal, premium, and precise.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#A0A0A0] text-[15px] sm:text-[17px] max-w-[520px] mx-auto sm:mx-0 mb-8 sm:mb-12 leading-relaxed"
        >
          From quick fixes to complex migrations. <br />
          I handle your tech so you can focus on what matters.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="btn-pill-primary"
          >
            Submit a Request
          </button>
          <div className="flex items-center gap-4 text-[13px] text-[#6F6F6F]">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>Fast response</span>
            </div>
            <span className="opacity-30">|</span>
            <div className="flex items-center gap-1.5">
              <Shield size={14} />
              <span>Satisfaction guaranteed</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Supported Devices */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-10"
        >
          {supportedDevices.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-[#6F6F6F]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <Icon size={20} />
              </div>
              <span className="text-[14px]">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[600px] mx-auto sm:mx-0"
        >
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#F5F5F5] mb-8">
            How it works
          </h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Submit your issue', desc: 'Describe what\'s happening. No tech jargon required.' },
              { step: '2', title: 'Get a quote', desc: 'I\'ll review and assign the appropriate fix tier.' },
              { step: '3', title: 'Approve & pay', desc: 'Once you approve, I\'ll get to work immediately.' },
              { step: '4', title: 'Problem solved', desc: 'I\'ll fix it, explain what happened, and ensure it stays fixed.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-semibold" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  {item.step}
                </div>
                <div>
                  <p className="text-[15px] text-[#F5F5F5] font-medium mb-1">{item.title}</p>
                  <p className="text-[14px] text-[#6F6F6F]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* One-Time Services */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-12 text-center sm:text-left">
          <p className="text-metadata mb-3">One-Time Fixes</p>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#F5F5F5]">
            Pay per fix. No commitment.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {oneTimeServices.map((service, index) => (
            <motion.div
              key={service.tier}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-6 sm:p-8 rounded-[24px] h-full flex flex-col"
              style={{
                background: '#141414',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Tier indicator */}
              <div
                className="w-3 h-3 rounded-full mb-4"
                style={{ background: service.color, boxShadow: `0 0 12px ${service.color}40` }}
              />

              <h3 className="text-[18px] font-semibold text-[#F5F5F5] mb-2">
                {service.name}
              </h3>

              <div className="text-[32px] font-semibold text-[#F5F5F5] mb-4">
                {service.price}
              </div>

              <p className="text-[14px] text-[#A0A0A0] mb-6">
                {service.description}
              </p>

              <ul className="space-y-2 mb-6 flex-grow">
                {service.examples.map(example => (
                  <li key={example} className="flex items-center text-[13px] text-[#6F6F6F]">
                    <div className="w-1 h-1 rounded-full bg-[#4F4F4F] mr-3" />
                    {example}
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#1F1F1F]">
                <p className="text-[13px] text-[#A0A0A0] italic">
                  {service.promise}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-[13px] text-[#6F6F6F] mt-8"
        >
          We'll review your request and confirm the correct fix tier before starting.
        </motion.p>
      </section>

      {/* Subscription Plans */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10 sm:mb-12 text-center sm:text-left">
          <p className="text-metadata mb-3">Monthly Plans</p>
          <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[#F5F5F5]">
            Ongoing support. Peace of mind.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px]">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.featured && (
                <motion.div
                  className="absolute inset-0 rounded-[24px] pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.15), inset 0 0 20px rgba(59, 130, 246, 0.05)',
                      '0 0 40px rgba(59, 130, 246, 0.25), inset 0 0 30px rgba(59, 130, 246, 0.1)',
                      '0 0 20px rgba(59, 130, 246, 0.15), inset 0 0 20px rgba(59, 130, 246, 0.05)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <div
                className="relative p-6 sm:p-8 rounded-[24px] h-full flex flex-col"
                style={{
                  background: '#141414',
                  border: plan.featured
                    ? '1px solid rgba(59, 130, 246, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {plan.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <span className="text-[10px] font-medium tracking-widest text-[#3b82f6] uppercase">Recommended</span>
                    </div>
                  </div>
                )}

                <h3 className="text-[13px] font-medium tracking-[0.05em] uppercase text-[#A0A0A0] mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-[36px] font-semibold text-[#F5F5F5]">
                    {plan.price}
                  </span>
                  <span className="text-[#6F6F6F] text-[14px]">{plan.period}</span>
                </div>

                <p className="text-[14px] text-[#A0A0A0] mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center text-[14px] text-[#A0A0A0]">
                      <div className="w-1 h-1 rounded-full bg-[#3b82f6] mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(`/login?mode=signup&plan=${plan.tier}`)}
                  className="w-full py-3.5 px-6 rounded-full text-[14px] font-medium transition-all duration-200"
                  style={{
                    background: plan.featured ? '#F5F5F5' : 'rgba(255, 255, 255, 0.04)',
                    color: plan.featured ? '#0B0B0B' : '#A0A0A0',
                    border: plan.featured ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 sm:gap-12"
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <MessageCircle size={16} className="text-[#6F6F6F]" />
            </div>
            <div>
              <p className="text-[14px] text-[#F5F5F5] mb-1 font-medium">Personal support</p>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                You work directly with me. No call centers, no runaround.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <Shield size={16} className="text-[#6F6F6F]" />
            </div>
            <div>
              <p className="text-[14px] text-[#F5F5F5] mb-1 font-medium">Satisfaction guaranteed</p>
              <p className="text-[13px] text-[#6F6F6F] leading-relaxed">
                Fixed or refunded. I stand behind my work.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[22px] font-semibold text-[#F5F5F5] mb-4 tracking-tight">
            Ready to fix it?
          </h2>
          <p className="text-[15px] text-[#6F6F6F] mb-8 max-w-[380px] mx-auto leading-relaxed">
            Submit your issue and I'll get back to you<br />
            with a quote within 24 hours.
          </p>
          <button
            onClick={() => navigate('/login?mode=signup')}
            className="btn-pill-primary"
          >
            Submit a Request
          </button>
        </motion.div>
      </section>

      <footer className="max-w-[1200px] mx-auto px-6 py-24 border-t border-[#181818]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[14px] text-[#6F6F6F]">
            Sentra — Premium Apple Tech Support
          </div>
          <div className="flex gap-12 text-[14px] text-[#6F6F6F]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#A0A0A0] transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#A0A0A0] transition-colors">Terms</button>
            <button onClick={() => navigate('/status')} className="hover:text-[#A0A0A0] transition-colors">Status</button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-[#181818]/50 text-[12px] text-[#4F4F4F]">
          <Shield size={12} />
          <span>Your data is secure and private</span>
        </div>
      </footer>
    </div>
  );
};
