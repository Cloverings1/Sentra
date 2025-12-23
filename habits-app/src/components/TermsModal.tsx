import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsModal = ({ isOpen, onAccept, onDecline }: TermsModalProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAccept = hasScrolledToBottom && checkbox1 && checkbox2;

  useEffect(() => {
    if (!isOpen) {
      setHasScrolledToBottom(false);
      setCheckbox1(false);
      setCheckbox2(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Consider scrolled to bottom when within 50px of the end
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHasScrolledToBottom(true);
      }
    }
  };

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[520px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: '#141414',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5]">
                Terms of Service
              </h2>
              <p className="text-[14px] text-[#6F6F6F] mt-2">
                Please read and accept our terms before continuing
              </p>
            </div>

            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <div className="px-8 pb-2">
                <p className="text-[12px] text-[#E85D4F] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                  Scroll to read all terms
                </p>
              </div>
            )}

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-8 py-4"
              style={{ maxHeight: '400px' }}
            >
              <div className="space-y-6 text-[14px] leading-relaxed text-[#A0A0A0]">
                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Agreement to Terms</h3>
                  <p>
                    By creating an account and using the Habits application (the "Service") operated by ATXCopy LLC ("ATXCopy"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.
                  </p>
                </section>

                <section className="p-4 rounded-lg" style={{ background: 'rgba(232, 93, 79, 0.1)', border: '1px solid rgba(232, 93, 79, 0.2)' }}>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">No Refund Policy</h3>
                  <p>
                    <strong>ALL PAYMENTS ARE FINAL AND NON-REFUNDABLE.</strong> No refunds will be issued under any circumstances. The Service requires significant server infrastructure and computing resources. Subscription fees are charged in advance and are non-refundable regardless of usage.
                  </p>
                </section>

                <section className="p-4 rounded-lg" style={{ background: 'rgba(232, 93, 79, 0.1)', border: '1px solid rgba(232, 93, 79, 0.2)' }}>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Account Termination</h3>
                  <p>
                    <strong>ATXCopy reserves the absolute right to suspend or terminate your account at any time, for any reason, with or without notice, and without any obligation to provide a refund.</strong> Upon termination, your right to use the Service will immediately cease.
                  </p>
                </section>

                <section className="p-4 rounded-lg" style={{ background: 'rgba(232, 93, 79, 0.1)', border: '1px solid rgba(232, 93, 79, 0.2)' }}>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Waiver of Right to Sue</h3>
                  <p>
                    <strong>BY USING THIS SERVICE, YOU EXPRESSLY WAIVE YOUR RIGHT TO SUE ATXCOPY LLC, ITS OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES.</strong> Any disputes shall be resolved through binding arbitration in Austin, Texas. You waive any right to participate in class action lawsuits. You release ATXCopy from any and all claims, demands, and damages.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Technical & Billing Support</h3>
                  <p>
                    You acknowledge that ATXCopy will address any technical issues or billing concerns within a reasonable timeframe as determined at our sole discretion. We are not obligated to provide 24/7 support or immediate resolution.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Use of the Service</h3>
                  <p>
                    You agree to use the Service only for lawful purposes. You will not attempt to interfere with the Service, access unauthorized areas, transmit malicious code, or impersonate others.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Disclaimer of Warranties</h3>
                  <p>
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. ATXCOPY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Limitation of Liability</h3>
                  <p>
                    ATXCOPY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. Maximum liability shall not exceed the amount paid for the Service in the 12 months preceding any claim.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Governing Law</h3>
                  <p>
                    These Terms are governed by the laws of the State of Texas. Any legal proceedings shall be brought exclusively in Travis County, Texas.
                  </p>
                </section>

                <section>
                  <h3 className="text-[16px] font-medium text-[#F5F5F5] mb-2">Contact</h3>
                  <p>
                    ATXCopy LLC, Austin, Texas — hello@atxcopy.com
                  </p>
                </section>

                {/* End marker */}
                <div className="text-center py-4 text-[12px] text-[#4F4F4F]">
                  — End of Terms —
                </div>
              </div>
            </div>

            {/* Checkboxes and Actions */}
            <div className="px-8 py-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
              {/* Double opt-in checkboxes */}
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-start gap-3 cursor-pointer transition-opacity ${!hasScrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox1}
                      onChange={(e) => setCheckbox1(e.target.checked)}
                      disabled={!hasScrolledToBottom}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
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

                <label
                  className={`flex items-start gap-3 cursor-pointer transition-opacity ${!hasScrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox2}
                      onChange={(e) => setCheckbox2(e.target.checked)}
                      disabled={!hasScrolledToBottom}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
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
                <button
                  onClick={onAccept}
                  disabled={!canAccept}
                  className="flex-1 py-3 px-4 rounded-lg text-[15px] font-medium transition-all"
                  style={{
                    backgroundColor: canAccept ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                    color: canAccept ? '#0B0B0B' : '#6F6F6F',
                    cursor: canAccept ? 'pointer' : 'not-allowed',
                  }}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
