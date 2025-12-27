import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import {
  X,
  Send,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Printer,
  HardDrive,
  Wifi,
  AppWindow,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Flame,
  Clock,
} from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Product = 'macbook' | 'imac' | 'iphone' | 'ipad' | 'apple_watch' | 'printer' | 'nas_storage' | 'network' | 'software' | 'other';

const PRIORITY_CONFIG: Record<Priority, { label: string; description: string; color: string; bgColor: string; icon: typeof Clock }> = {
  low: {
    label: 'Low',
    description: 'General question or minor issue',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    icon: Clock,
  },
  medium: {
    label: 'Medium',
    description: 'Affecting productivity but has workaround',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    description: 'Significant impact, needs attention soon',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    description: 'Critical issue, work is blocked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: Flame,
  },
};

const PRODUCT_CONFIG: Record<Product, { label: string; icon: typeof Laptop }> = {
  macbook: { label: 'MacBook', icon: Laptop },
  imac: { label: 'iMac / Mac', icon: Monitor },
  iphone: { label: 'iPhone', icon: Smartphone },
  ipad: { label: 'iPad', icon: Tablet },
  apple_watch: { label: 'Apple Watch', icon: Watch },
  printer: { label: 'Printer', icon: Printer },
  nas_storage: { label: 'NAS / Storage', icon: HardDrive },
  network: { label: 'Network / WiFi', icon: Wifi },
  software: { label: 'Software / Apps', icon: AppWindow },
  other: { label: 'Other', icon: HelpCircle },
};

export const TicketModal = ({ isOpen, onClose }: TicketModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setTimeout(() => {
      setStep(1);
      setProduct(null);
      setPriority('medium');
      setTitle('');
      setDescription('');
      setSubmitted(false);
    }, 300);
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !product || !title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        title: title.trim(),
        description: description.trim(),
        priority,
        product,
        status: 'pending_review',
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        device_info: navigator.userAgent,
      });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(handleClose, 2500);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = product !== null;
  const canProceedStep2 = true; // Priority has default
  const canSubmit = title.trim().length > 0 && description.trim().length >= 20;

  const totalSteps = 3;

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
            className="relative w-full max-w-[560px] overflow-hidden"
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
            <div className="p-8">
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
                  <p className="text-[20px] font-medium mb-2 text-[#F5F5F5]">
                    Request Submitted
                  </p>
                  <p className="text-[14px] text-[#6F6F6F]">
                    I'll review your issue and get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-[22px] font-semibold tracking-tight text-[#F5F5F5]">
                        New Support Request
                      </h2>
                      <p className="text-[13px] mt-1 text-[#6F6F6F]">
                        Step {step} of {totalSteps}
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/8 text-[#6F6F6F]"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: s <= step ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Step Content */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-[15px] font-medium text-[#F5F5F5] mb-4">
                          What device or service needs help?
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {(Object.entries(PRODUCT_CONFIG) as [Product, typeof PRODUCT_CONFIG.macbook][]).map(([key, config]) => {
                            const Icon = config.icon;
                            const isSelected = product === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setProduct(key)}
                                className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                                style={{
                                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                  border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                                }}
                              >
                                <Icon
                                  size={20}
                                  style={{ color: isSelected ? '#3b82f6' : '#6F6F6F' }}
                                />
                                <span
                                  className="text-[14px] font-medium"
                                  style={{ color: isSelected ? '#3b82f6' : '#A0A0A0' }}
                                >
                                  {config.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-[15px] font-medium text-[#F5F5F5] mb-4">
                          How urgent is this issue?
                        </h3>
                        <div className="space-y-3">
                          {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG.low][]).map(([key, config]) => {
                            const Icon = config.icon;
                            const isSelected = priority === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setPriority(key)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                                style={{
                                  background: isSelected ? config.bgColor : 'rgba(255, 255, 255, 0.04)',
                                  border: `1px solid ${isSelected ? config.color + '40' : 'rgba(255, 255, 255, 0.06)'}`,
                                }}
                              >
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ background: config.bgColor }}
                                >
                                  <Icon size={20} style={{ color: config.color }} />
                                </div>
                                <div className="flex-1">
                                  <p
                                    className="text-[14px] font-medium"
                                    style={{ color: isSelected ? config.color : '#F5F5F5' }}
                                  >
                                    {config.label}
                                  </p>
                                  <p className="text-[12px] text-[#6F6F6F]">
                                    {config.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: config.color }}
                                  >
                                    <CheckCircle size={14} className="text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-[15px] font-medium text-[#F5F5F5] mb-4">
                          Describe the issue
                        </h3>

                        {/* Selected Summary */}
                        <div className="flex gap-2 mb-4">
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
                            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                          >
                            {product && (() => {
                              const ProductIcon = PRODUCT_CONFIG[product].icon;
                              return <ProductIcon size={14} className="text-[#6F6F6F]" />;
                            })()}
                            <span className="text-[#A0A0A0]">
                              {product && PRODUCT_CONFIG[product].label}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
                            style={{
                              background: PRIORITY_CONFIG[priority].bgColor,
                              color: PRIORITY_CONFIG[priority].color,
                            }}
                          >
                            {(() => {
                              const PriorityIcon = PRIORITY_CONFIG[priority].icon;
                              return <PriorityIcon size={14} />;
                            })()}
                            <span>{PRIORITY_CONFIG[priority].label}</span>
                          </div>
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide text-[#6F6F6F]">
                            What's the issue?
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., My MacBook won't connect to WiFi"
                            className="w-full px-4 py-3.5 rounded-xl text-[15px] outline-none transition-all focus:ring-2 focus:ring-white/10 text-[#F5F5F5]"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                            autoFocus
                            maxLength={100}
                          />
                        </div>

                        {/* Description Input */}
                        <div>
                          <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide text-[#6F6F6F]">
                            Tell me more
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What happened? When did it start? Any error messages? The more detail, the better I can help."
                            rows={4}
                            className="w-full px-4 py-3.5 rounded-xl text-[15px] resize-none outline-none transition-all focus:ring-2 focus:ring-white/10 text-[#F5F5F5]"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          />
                          <p className="text-[11px] mt-2 text-[#6F6F6F]">
                            {description.length < 20
                              ? `${20 - description.length} more characters needed`
                              : 'Looking good!'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-8">
                    {step > 1 && (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all hover:bg-white/8 text-[#A0A0A0]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                    )}

                    {step < 3 ? (
                      <button
                        onClick={() => setStep(step + 1)}
                        disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all"
                        style={{
                          background:
                            (step === 1 ? canProceedStep1 : canProceedStep2)
                              ? 'rgba(59, 130, 246, 0.9)'
                              : 'rgba(255, 255, 255, 0.08)',
                          color:
                            (step === 1 ? canProceedStep1 : canProceedStep2)
                              ? '#fff'
                              : '#6F6F6F',
                          cursor:
                            (step === 1 ? canProceedStep1 : canProceedStep2)
                              ? 'pointer'
                              : 'not-allowed',
                        }}
                      >
                        Continue
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all"
                        style={{
                          background: canSubmit ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
                          color: canSubmit ? '#0B0B0B' : '#6F6F6F',
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
                    )}
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
