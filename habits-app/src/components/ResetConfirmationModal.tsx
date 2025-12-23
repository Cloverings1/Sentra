import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckIcon = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface ConfirmCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  delay?: number;
}

const ConfirmCheckbox = ({ checked, onChange, children, delay = 0 }: ConfirmCheckboxProps) => (
  <motion.label
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="flex items-start gap-4 cursor-pointer group select-none"
    onClick={() => onChange(!checked)}
  >
    <div
      className="relative mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
      style={{
        background: checked ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
        border: checked ? 'none' : '1px solid rgba(239, 68, 68, 0.4)',
      }}
    >
      <motion.div
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="text-white"
      >
        <CheckIcon />
      </motion.div>
    </div>
    <span
      className="text-[14px] leading-relaxed transition-opacity duration-200"
      style={{
        color: checked ? 'rgba(239, 68, 68, 0.6)' : '#ef4444',
        textDecoration: checked ? 'line-through' : 'none',
      }}
    >
      {children}
    </span>
  </motion.label>
);

export const ResetConfirmationModal = ({ isOpen, onClose }: ResetConfirmationModalProps) => {
  const { resetAllHabits } = useHabits();
  const [checks, setChecks] = useState([false, false, false]);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = checks.every(Boolean);
  const checkedCount = checks.filter(Boolean).length;

  const handleCheck = (index: number, value: boolean) => {
    const newChecks = [...checks];
    newChecks[index] = value;
    setChecks(newChecks);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
      await resetAllHabits();
      handleClose();
    } catch (err) {
      console.error('Reset failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    setChecks([false, false, false]);
    setError(null);
    onClose();
  };

  const confirmations = [
    "All my habits and progress will be permanently erased",
    "This cannot be recovered or undone",
    "Jonas himself cannot undo this",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[380px] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-8"
              >
                <h2
                  className="text-[20px] font-semibold tracking-tight mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Reset everything?
                </h2>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Your habits, streaks, and history will vanish.
                  <br />
                  Your subscription stays intact.
                </p>
              </motion.div>

              {/* Confirmations */}
              <div className="space-y-5 mb-8">
                {confirmations.map((text, index) => (
                  <ConfirmCheckbox
                    key={index}
                    checked={checks[index]}
                    onChange={(value) => handleCheck(index, value)}
                    delay={0.15 + index * 0.05}
                  >
                    {text}
                  </ConfirmCheckbox>
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[13px] mb-6 text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Progress indicator */}
              <div className="mb-6">
                <div
                  className="h-[2px] rounded-full overflow-hidden"
                  style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: '#ef4444' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(checkedCount / 3) * 100}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-200 hover:bg-white/8"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={!allChecked || isResetting}
                  className="flex-1 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-200"
                  style={{
                    background: allChecked ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                    color: allChecked ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                    cursor: allChecked && !isResetting ? 'pointer' : 'not-allowed',
                    opacity: isResetting ? 0.6 : 1,
                  }}
                >
                  {isResetting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      />
                      Resetting
                    </span>
                  ) : (
                    'Reset all'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
