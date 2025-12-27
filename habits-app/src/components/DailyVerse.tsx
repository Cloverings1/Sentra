import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getDailyPrayerVerse, type PrayerVerse } from '../utils/dailyVerse';

type DailyVerseProps = {
  userSeed?: string;
};

export function DailyVerse({ userSeed }: DailyVerseProps) {
  const [verse, setVerse] = useState<PrayerVerse | null>(null);

  // Memoize seed so it doesn't thrash state.
  const seed = useMemo(() => userSeed ?? 'global', [userSeed]);

  useEffect(() => {
    // localStorage is only available client-side; compute after mount.
    setVerse(getDailyPrayerVerse({ userSeed: seed }));
  }, [seed]);

  if (!verse) return null;

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    >
      <div
        className="px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <p
          className="text-[13px] leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {verse.text}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {verse.reference}
          </p>
          {verse.category && (
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-semibold"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
            >
              {verse.category}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}


