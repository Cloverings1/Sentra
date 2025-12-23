import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ChangelogEntry {
  date: string;
  entries: {
    title: string;
    time?: string;
    description: string;
    items?: string[];
    highlight?: boolean;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    date: 'December 23, 2025',
    entries: [
      {
        title: 'Alpha Launch',
        time: '9:38 AM CST',
        description: 'Habits app is going into alpha. After weeks of building in private, we\'re finally ready to share this with a small group of friends.',
        items: [
          'Core habit tracking with daily, weekly, and custom schedules',
          'Streak tracking with motivational messages',
          'Calendar view for monthly progress',
          'Stats dashboard with completion analytics',
          'Cloud sync across devices',
          'Row-level security for complete data privacy',
        ],
        highlight: true,
      },
    ],
  },
  {
    date: 'December 22, 2025',
    entries: [
      {
        title: 'Security Lockdown',
        description: 'Critical security audit completed. Enabled row-level security on all tables. Your data is now completely isolated at the database level.',
      },
      {
        title: 'Create Habit Fix',
        description: 'Fixed a bug where creating habits would silently fail. Added proper error handling and loading states.',
      },
      {
        title: 'Dashboard Revamp',
        description: 'Major visual and functional improvements to the home screen.',
        items: [
          'Global streak indicator',
          'Progress tracking',
          'Motivational messages',
          'Celebration animations',
          'Completion dots on calendar',
        ],
      },
    ],
  },
  {
    date: 'December 21, 2025',
    entries: [
      {
        title: 'Foundation',
        description: 'Initial build with authentication, habit CRUD operations, and basic UI. Dark mode aesthetic with liquid glass design system.',
      },
    ],
  },
];

export const ChangelogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] selection:bg-[#E85D4F]/30">
      {/* Navigation */}
      <nav className="max-w-[720px] mx-auto px-6 py-10 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-[18px] font-semibold tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          Habits
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-[14px] text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
        >
          Back
        </button>
      </nav>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[720px] mx-auto px-6 pt-8 pb-20"
      >
        <p className="text-[12px] uppercase tracking-[0.15em] text-[#6F6F6F] mb-6">
          What's New
        </p>
        <h1 className="text-[56px] font-semibold tracking-[-0.03em] leading-[1.1]">
          Changelog
        </h1>
        <p className="text-[17px] text-[#6F6F6F] mt-6 leading-relaxed max-w-[480px]">
          A record of everything we've shipped. Updates, fixes, and new features.
        </p>
      </motion.header>

      {/* Timeline */}
      <main className="max-w-[720px] mx-auto px-6 pb-32">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-2 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, #2A2A2A, transparent)' }}
          />

          {changelog.map((section, sectionIndex) => (
            <motion.div
              key={section.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: sectionIndex * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="mb-16"
            >
              {/* Date header */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-[15px] h-[15px] rounded-full border-2 border-[#2A2A2A] bg-[#0B0B0B] z-10"
                />
                <h2 className="text-[13px] font-medium tracking-[0.05em] text-[#6F6F6F] uppercase">
                  {section.date}
                </h2>
              </div>

              {/* Entries */}
              <div className="pl-[31px] space-y-8">
                {section.entries.map((entry, entryIndex) => (
                  <motion.article
                    key={entry.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: sectionIndex * 0.1 + entryIndex * 0.05,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className={`group ${entry.highlight ? 'relative' : ''}`}
                  >
                    {entry.highlight && (
                      <div
                        className="absolute -inset-6 rounded-2xl -z-10"
                        style={{
                          background: 'linear-gradient(135deg, rgba(232, 93, 79, 0.08), transparent)',
                          border: '1px solid rgba(232, 93, 79, 0.15)'
                        }}
                      />
                    )}

                    <div className="flex items-baseline gap-3 mb-3">
                      <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-[#F5F5F5]">
                        {entry.title}
                      </h3>
                      {entry.time && (
                        <span className="text-[12px] font-medium text-[#E85D4F] tracking-wide">
                          {entry.time}
                        </span>
                      )}
                    </div>

                    <p className="text-[15px] text-[#A0A0A0] leading-relaxed mb-4">
                      {entry.description}
                    </p>

                    {entry.items && (
                      <ul className="space-y-2">
                        {entry.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-[14px] text-[#6F6F6F]"
                          >
                            <span
                              className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.highlight ? '#E85D4F' : '#3A3A3A' }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.article>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[13px] text-[#4F4F4F] text-center mt-20 italic"
        >
          Quietly building since 2025.
        </motion.p>
      </main>
    </div>
  );
};
