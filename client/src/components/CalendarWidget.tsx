import { useState, useEffect } from 'react';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

export default function CalendarWidget({ onDateSelect }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getCalendarWeek = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarWeek = getCalendarWeek(selectedDate);

  const days = [];
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onDateSelect) {
      onDateSelect(today);
    }
  };

  return (
    <div className="card p-4">
      {/* Calendar Week and Current Time */}
      <div className="mb-4 pb-4 border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-medium" style={{ color: '#475569' }}>Kalenderwoche</p>
            <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>KW {calendarWeek}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: '#475569' }}>Aktuelle Zeit</p>
            <CurrentTime />
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          style={{ color: '#475569' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          style={{ color: '#475569' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium py-1" style={{ color: '#64748B' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDayClick(day)}
            disabled={!day}
            className={`aspect-square rounded-lg text-sm font-medium transition ${
              !day ? 'cursor-default' : 'hover:bg-gray-100 cursor-pointer'
            } ${
              isToday(day)
                ? 'bg-blue-600 text-white font-bold'
                : isSelected(day)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Today Button */}
      <button
        onClick={handleToday}
        className="w-full mt-3 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-100"
        style={{ color: '#2563EB', border: '1px solid #E2E8F0' }}
      >
        Heute
      </button>
    </div>
  );
}

function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <p className="text-xl font-bold" style={{ color: '#2563EB' }}>
      {formatTime(time)}
    </p>
  );
}

