import { motion } from 'framer-motion';
import { getWeekDays, formatDate } from '../utils/dateUtils';
import { useHabits } from '../contexts/HabitsContext';
import { CompletionDots } from './CompletionDots';

interface WeekViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_ABBREVIATIONS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const WeekView = ({ selectedDate, onSelectDate }: WeekViewProps) => {
  const weekDays = getWeekDays(new Date());
  const selectedDateStr = formatDate(selectedDate);
  const { getCompletedHabitsForDate } = useHabits();

  return (
    <div className="date-strip">
      {weekDays.map((day) => {
        const isSelected = formatDate(day) === selectedDateStr;
        const dayAbbrev = DAY_ABBREVIATIONS[day.getDay()];
        const dayNumber = day.getDate();
        const completedHabits = getCompletedHabitsForDate(day);

        return (
          <motion.button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={`date-item ${isSelected ? 'active' : ''}`}
            whileTap={{ scale: 0.95 }}
          >
            <span className="date-day-num">
              {dayNumber}
            </span>
            <span className="date-day-name">
              {dayAbbrev}
            </span>

            {/* Completion dots below the date */}
            <CompletionDots
              habits={completedHabits}
              size={4}
              maxVisible={4}
              overlapPercent={30}
              className="mt-1"
            />
          </motion.button>
        );
      })}
    </div>
  );
};
