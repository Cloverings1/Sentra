import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface MicroConfettiProps {
  isActive: boolean;
  colors?: string[];
  particleCount?: number;
}

// Confetti particle component - lighter weight than FoundingCelebration
const ConfettiParticle = ({ color }: { color: string }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 0.3, []);
  const randomDuration = useMemo(() => 1.5 + Math.random() * 1, []);
  const randomRotation = useMemo(() => Math.random() * 360, []);
  const size = useMemo(() => 4 + Math.random() * 6, []);
  const shape = useMemo(() => Math.random() > 0.5 ? 'circle' : 'rect', []);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${randomX}%`,
        top: '40%',
        width: size,
        height: shape === 'rect' ? size * 0.6 : size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        boxShadow: `0 0 6px ${color}60`,
      }}
      initial={{
        y: 0,
        opacity: 0,
        rotate: 0,
        scale: 0,
      }}
      animate={{
        y: [0, -80 - Math.random() * 100, 150 + Math.random() * 100],
        opacity: [0, 1, 1, 0],
        rotate: randomRotation,
        scale: [0, 1, 1, 0],
        x: [(Math.random() - 0.5) * 200],
      }}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
      }}
    />
  );
};

export const MicroConfetti = ({
  isActive,
  colors = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'],
  particleCount = 20,
}: MicroConfettiProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
    }));
  }, [particleCount, colors]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <ConfettiParticle
              key={particle.id}
              color={particle.color}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
