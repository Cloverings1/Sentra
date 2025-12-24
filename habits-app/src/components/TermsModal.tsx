import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsModal = ({ isOpen, onAccept, onDecline }: TermsModalProps) => {
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  const canAccept = checkbox1 && checkbox2;

  useEffect(() => {
    if (!isOpen) {
      setCheckbox1(false);
      setCheckbox2(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[540px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: '#141414',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5] mb-2">
                Terms of Service
              </h2>
              <p className="text-[14px] text-[#6F6F6F]">
                Review the key terms before continuing
              </p>
            </div>

            {/* Content - No scrolling required */}
            <div className="px-8 py-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
              <div className="space-y-4 mb-6">
                {/* Key Points */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="text-[#E85D4F] mt-0.5">✓</div>
                    <p className="text-[14px] text-[#A0A0A0]">
                      <span className="text-[#F5F5F5] font-medium">Payments are final and non-refundable</span> under all circumstances, including cancellation or dissatisfaction
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-[#E85D4F] mt-0.5">✓</div>
                    <p className="text-[14px] text-[#A0A0A0]">
                      <span className="text-[#F5F5F5] font-medium">We can terminate your account</span> at any time for any reason without notice or compensation
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-[#E85D4F] mt-0.5">✓</div>
                    <p className="text-[14px] text-[#A0A0A0]">
                      <span className="text-[#F5F5F5] font-medium">Disputes resolved through binding arbitration</span>, not court proceedings or class actions
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-[#E85D4F] mt-0.5">✓</div>
                    <p className="text-[14px] text-[#A0A0A0]">
                      <span className="text-[#F5F5F5] font-medium">We provide support within a reasonable timeframe</span> at our sole discretion
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-[#E85D4F] mt-0.5">✓</div>
                    <p className="text-[14px] text-[#A0A0A0]">
                      <span className="text-[#F5F5F5] font-medium">Service provided as-is</span> with no warranties of uninterrupted or error-free operation
                    </p>
                  </div>
                </div>

                {/* Full Terms Link */}
                <div className="pt-2">
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#E85D4F] hover:text-[#F5A89D] transition-colors underline"
                  >
                    View full terms of service →
                  </a>
                </div>
              </div>
            </div>

            {/* Checkboxes and Actions */}
            <div className="px-8 py-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
              {/* Double opt-in checkboxes */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer transition-opacity hover:opacity-90">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox1}
                      onChange={(e) => setCheckbox1(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        borderColor: checkbox1 ? '#E85D4F' : '#3A3A3A',
                        backgroundColor: checkbox1 ? '#E85D4F' : 'transparent',
                      }}
                    >
                      {checkbox1 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] text-[#A0A0A0]">
                    I have read and agree to the Terms of Service, including the no-refund policy and binding arbitration clause
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer transition-opacity hover:opacity-90">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox2}
                      onChange={(e) => setCheckbox2(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        borderColor: checkbox2 ? '#E85D4F' : '#3A3A3A',
                        backgroundColor: checkbox2 ? '#E85D4F' : 'transparent',
                      }}
                    >
                      {checkbox2 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] text-[#A0A0A0]">
                    I waive my right to sue ATXCopy LLC and agree to allow ATXCopy to address technical and billing concerns within a reasonable timeframe
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onDecline}
                  className="flex-1 py-3 px-4 rounded-lg text-[15px] font-medium transition-all hover:bg-white/10"
                  style={{ color: '#A0A0A0' }}
                >
                  Decline
                </button>
                <motion.button
                  onClick={onAccept}
                  disabled={!canAccept}
                  whileTap={canAccept ? { scale: 0.95 } : {}}
                  className="flex-1 py-3 px-4 rounded-lg text-[15px] font-medium transition-all"
                  style={{
                    backgroundColor: canAccept ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                    color: canAccept ? '#0B0B0B' : '#6F6F6F',
                    cursor: canAccept ? 'pointer' : 'not-allowed',
                  }}
                >
                  Accept & Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
