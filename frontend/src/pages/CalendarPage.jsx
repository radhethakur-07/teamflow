import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckSquare,
  Sparkles,
  LayoutGrid,
  Columns,
  FolderKanban
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';

export const CalendarPage = () => {
  const { tasks, projects } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month View calculations
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Week View calculations
  const getWeekDates = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day;
    const startOfWeek = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const activeWeekDates = getWeekDates(currentDate);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Map tasks to dates
  const getTasksForDate = (targetDate) => {
    const tYear = targetDate.getFullYear();
    const tMonth = targetDate.getMonth();
    const tDay = targetDate.getDate();

    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === tYear && d.getMonth() === tMonth && d.getDate() === tDay;
    });
  };

  // Map projects to deadline dates
  const getProjectsForDate = (targetDate) => {
    const tYear = targetDate.getFullYear();
    const tMonth = targetDate.getMonth();
    const tDay = targetDate.getDate();

    return projects.filter((p) => {
      if (!p.targetDate && !p.dueDate) return false;
      const d = new Date(p.targetDate || p.dueDate);
      return d.getFullYear() === tYear && d.getMonth() === tMonth && d.getDate() === tDay;
    });
  };

  // Format header display label
  const getHeaderLabel = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`;
    }
    const start = activeWeekDates[0];
    const end = activeWeekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${monthNames[start.getMonth()].slice(0, 3)} ${start.getDate()} – ${monthNames[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
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

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-warm-200 rounded-xl p-1 shadow-warm-xs">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-heading font-bold rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-terracotta-500 text-white shadow-warm-xs'
                  : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-heading font-bold rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-terracotta-500 text-white shadow-warm-xs'
                  : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-xl p-1 shadow-warm-sm">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-heading font-bold text-warm-900 px-3 whitespace-nowrap">
              {getHeaderLabel()}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-warm-500 hover:text-warm-900 rounded-lg hover:bg-warm-100 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
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
              const dateObj = new Date(year, month, day);
              const dayTasks = getTasksForDate(dateObj);
              const dayProjects = getProjectsForDate(dateObj);
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

                    {(dayTasks.length > 0 || dayProjects.length > 0) && (
                      <span className="text-[10px] text-warm-400 font-bold">
                        {dayTasks.length + dayProjects.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / Items list */}
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {/* Project Milestones */}
                    {dayProjects.map((p) => (
                      <div
                        key={`proj-${p._id || p.id}`}
                        className="w-full text-left p-1 rounded-md text-[10px] font-bold truncate block bg-terracotta-100 text-terracotta-800 border border-terracotta-200"
                        title={`Project Deadline: ${p.name}`}
                      >
                        <span className="truncate">🎯 {p.name}</span>
                      </div>
                    ))}

                    {/* Tasks */}
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
      )}

      {/* WEEKLY TIMELINE VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          {/* 7 Columns for the Week */}
          <div className="grid grid-cols-7 divide-x divide-warm-200 min-h-[500px]">
            {activeWeekDates.map((dayDate, idx) => {
              const dayTasks = getTasksForDate(dayDate);
              const dayProjects = getProjectsForDate(dayDate);
              const isToday =
                new Date().getDate() === dayDate.getDate() &&
                new Date().getMonth() === dayDate.getMonth() &&
                new Date().getFullYear() === dayDate.getFullYear();

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isToday ? 'bg-terracotta-50/20' : 'bg-white'}`}
                >
                  {/* Day Header */}
                  <div className={`p-3 text-center border-b border-warm-200 ${isToday ? 'bg-terracotta-50' : 'bg-warm-50/70'}`}>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-warm-500 block">
                      {weekDays[dayDate.getDay()]}
                    </span>
                    <span
                      className={`inline-block mt-1 w-7 h-7 leading-7 text-center text-xs font-heading font-extrabold rounded-full ${
                        isToday
                          ? 'bg-terracotta-500 text-white shadow-warm-xs'
                          : 'text-warm-800'
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                  </div>

                  {/* Day Schedule / Timeline Column */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                    {/* Project Deadlines */}
                    {dayProjects.map((p) => (
                      <div
                        key={`week-proj-${p._id || p.id}`}
                        className="p-2 rounded-xl bg-terracotta-100/80 border border-terracotta-200 text-terracotta-900 space-y-1 shadow-warm-xs"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-700">
                          <FolderKanban className="w-3 h-3" />
                          <span>Milestone</span>
                        </div>
                        <div className="font-heading font-bold text-xs truncate">
                          {p.name}
                        </div>
                      </div>
                    ))}

                    {/* Scheduled Tasks */}
                    {dayTasks.map((t) => (
                      <div
                        key={`week-task-${t._id || t.id}`}
                        onClick={() => setSelectedTask(t)}
                        className="p-2.5 rounded-xl bg-warm-50 hover:bg-warm-100 border border-warm-200 cursor-pointer transition-all space-y-1.5 shadow-warm-xs group"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              t.priority === 'urgent'
                                ? 'terracotta'
                                : t.priority === 'high'
                                ? 'mustard'
                                : 'charcoal'
                            }
                            size="sm"
                          >
                            {t.priority}
                          </Badge>
                          <span className="text-[10px] text-warm-400 capitalize">
                            {t.column}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-warm-900 group-hover:text-terracotta-600 transition-colors line-clamp-2">
                          {t.title}
                        </h4>

                        {t.description && (
                          <p className="text-[11px] text-warm-500 line-clamp-1">
                            {t.description}
                          </p>
                        )}
                      </div>
                    ))}

                    {dayTasks.length === 0 && dayProjects.length === 0 && (
                      <div className="h-full flex items-center justify-center text-center p-3">
                        <span className="text-[11px] text-warm-300 italic">No deadlines</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
