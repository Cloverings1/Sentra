import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { X, Send, CheckCircle } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal = ({ isOpen, onClose }: TicketModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setSubmitted(false);
    }, 300);
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        title: title.trim(),
        description: description.trim(),
        status: 'pending_review',
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        device_info: navigator.userAgent,
      });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(handleClose, 2000);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim().length > 0 && description.trim().length >= 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[520px] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(24, 24, 24, 0.98) 0%, rgba(18, 18, 18, 0.98) 100%)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255,255,255,0.08) inset',
            }}
          >
            <div className="p-8 sm:p-10">
              {/* Success State */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.12)' }}
                  >
                    <CheckCircle size={32} className="text-[#22c55e]" />
                  </div>
                  <p className="text-[20px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Request Submitted
                  </p>
                  <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                    I'll review your issue and get back to you with a quote within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2
                        className="text-[22px] font-semibold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        New Support Request
                      </h2>
                      <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        Describe your issue and I'll get back to you with a quote.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/8"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    {/* Title Input */}
                    <div>
                      <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        What's the issue?
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., My MacBook won't connect to WiFi"
                        className="w-full px-5 py-4 rounded-xl text-[15px] outline-none transition-all focus:ring-2 focus:ring-white/10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                        }}
                        autoFocus
                        maxLength={100}
                      />
                    </div>

                    {/* Description Input */}
                    <div>
                      <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Tell me more
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What happened? When did it start? Any error messages? The more detail, the better I can help."
                        rows={5}
                        className="w-full px-5 py-4 rounded-xl text-[15px] resize-none outline-none transition-all focus:ring-2 focus:ring-white/10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                        {description.length < 20 ? `${20 - description.length} more characters needed` : 'Looking good!'}
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className="w-full py-4 rounded-xl text-[15px] font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        background: canSubmit ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
                        color: canSubmit ? '#0B0B0B' : 'var(--text-muted)',
                        cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      {isSubmitting ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Request
                        </>
                      )}
                    </button>

                    <p className="text-[12px] text-center" style={{ color: 'var(--text-muted)' }}>
                      I'll review your request and send you a quote before any work begins.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
