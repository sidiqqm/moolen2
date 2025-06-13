import { useState, useEffect } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function RealCalendar({ selectedDate, onDateSelect, entries }) {
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getDayName = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const hasEntryForDate = (date) => {
    return entries.some(entry => 
      new Date(entry.date).toDateString() === date.toDateString()
    );
  };

  const changeMonth = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const prevMonthDays = firstDay.getDay();
    const nextMonthDays = 6 - lastDay.getDay();
    
    const result = [];
    
    // Previous month days
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(currentYear, currentMonth, -i + 1);
      result.push(createCalendarDay(date, today));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i);
      result.push(createCalendarDay(date, today));
    }
    
    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      result.push(createCalendarDay(date, today));
    }
    
    setCalendarDays(result);
  };

  const createCalendarDay = (date, today) => {
    return {
      date: date,
      dayNumber: date.getDate(),
      dayName: getDayName(date),
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === selectedDate.toDateString(),
      hasEntry: hasEntryForDate(date),
      isCurrentMonth: date.getMonth() === currentMonth
    };
  };

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, currentYear, selectedDate, entries]);

  const handleDateSelect = (date) => {
    if (date.getMonth() !== currentMonth) {
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    onDateSelect(date);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h3 className="font-semibold">
          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-2 pb-3">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateSelect(day.date)}
              className={cn(
                "flex flex-col items-center justify-center flex-shrink-0 w-[60px] h-[60px] rounded-full cursor-pointer transition-all relative",
                day.isSelected
                  ? "bg-indigo-600 text-white shadow-md"
                  : day.isCurrentMonth 
                    ? "bg-white text-gray-800 hover:bg-gray-100" 
                    : "bg-gray-100 text-gray-400",
                day.isToday && !day.isSelected && "border-2 border-indigo-400"
              )}
            >
              <span className="text-sm font-semibold">{day.dayNumber}</span>
              <span className="text-[10px]">{day.dayName}</span>
              {day.hasEntry && (
                <div className="absolute bottom-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RealCalendar;