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
  const [currentMonth, setCurrentMonth] = useState('November 2026');

  // Days in November 2026 (Starts on Sunday Nov 1)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map tasks to dates
  const getTasksForDay = (day) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-11-${dayStr}`;
    return tasks.filter((t) => t.dueDate === dateStr);
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
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-heading font-bold text-warm-900 px-3">
              {currentMonth}
            </span>
            <button
              type="button"
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={() => {}}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-warm-200 bg-warm-100/60 text-center text-xs font-heading font-bold text-warm-700 py-3">
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-warm-100 min-h-[600px]">
          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === 6; // Current local time: Nov 6

            return (
              <div
                key={day}
                className={`p-2 sm:p-2.5 min-h-[90px] sm:min-h-[110px] space-y-1.5 transition-colors hover:bg-warm-50/50 ${
                  isToday ? 'bg-terracotta-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-terracotta-500 text-white shadow-warm-sm'
                        : 'text-warm-700'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-warm-400 font-bold hidden sm:inline">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="space-y-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="px-2 py-1 rounded bg-white border border-warm-200 shadow-warm-sm hover:border-terracotta-400 cursor-pointer text-left transition-all truncate"
                    >
                      <span className="text-[11px] font-semibold text-warm-900 truncate block">
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Inspection Modal from Calendar */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title}
        description={`Scheduled deadline on ${selectedTask?.dueDate}`}
        maxWidth="sm"
      >
        {selectedTask && (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-warm-500">Priority:</span>
              <Badge variant={selectedTask.priority === 'urgent' ? 'terracotta' : 'mustard'} size="sm">
                {selectedTask.priority}
              </Badge>
            </div>
            <div className="p-3 bg-warm-50 rounded-xl border border-warm-200 text-xs text-warm-700">
              {selectedTask.description || 'No description added.'}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedTask(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
