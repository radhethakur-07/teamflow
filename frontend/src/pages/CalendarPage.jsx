import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';

export const CalendarPage = () => {
  const { tasks, projects } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Map tasks to dates
  const getTasksForDay = (day) => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            Team Calendar
          </h1>
          <p className="text-xs text-warm-500">
            Sprint timelines, deliverable deadlines, and milestone schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-xl p-1 shadow-warm-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-heading font-bold text-warm-900 px-3">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid Frame */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 border-b border-warm-200 bg-warm-50/80 text-center py-2.5 text-[10px] font-heading font-bold uppercase tracking-wider text-warm-500">
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-warm-100 text-xs">
          {paddingDays.map((p) => (
            <div key={`pad-${p}`} className="min-h-[110px] p-2 bg-warm-50/30" />
          ))}

          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={day}
                className={`min-h-[110px] p-2 space-y-1.5 transition-colors hover:bg-warm-50/50 ${
                  isToday ? 'bg-terracotta-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block w-6 h-6 leading-6 text-center text-xs font-heading font-bold rounded-full ${
                      isToday
                        ? 'bg-terracotta-500 text-white shadow-warm-xs'
                        : 'text-warm-700'
                    }`}
                  >
                    {day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-warm-400 font-bold">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task badges */}
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {dayTasks.map((t) => (
                    <button
                      key={t._id || t.id}
                      type="button"
                      onClick={() => setSelectedTask(t)}
                      className="w-full text-left p-1 rounded-md text-[11px] font-medium truncate block transition-transform hover:scale-[1.02] bg-warm-100/90 text-warm-900 border border-warm-200"
                    >
                      <span className="truncate">{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Inspection Modal */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          description={`Due: ${new Date(selectedTask.dueDate).toLocaleDateString()}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Badge variant="terracotta" size="sm">
                Priority: {selectedTask.priority}
              </Badge>
              <Badge variant="charcoal" size="sm">
                Status: {selectedTask.column}
              </Badge>
            </div>

            <p className="text-xs text-warm-700 leading-relaxed bg-warm-50 p-3 rounded-xl border border-warm-200">
              {selectedTask.description || 'No description provided.'}
            </p>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
