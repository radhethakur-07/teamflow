import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import taskService from '../services/taskService.js';
import Tabs from '../components/common/Tabs.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const MyTasksPage = () => {
  const { workspace, tasks, addTask, moveTask, currentUser, activeProject, projects } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [myTasksList, setMyTasksList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const wsId = workspace?._id || workspace?.id;
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!wsId) return;
      setIsLoading(true);
      try {
        const data = await taskService.getMyTasks(wsId);
        setMyTasksList(data || []);
      } catch (err) {
        // Fallback filter from all workspace tasks
        const fallback = tasks.filter((t) => {
          const assignees = t.assigneeIds || [];
          return assignees.some((a) => (a._id || a.id || a) === currentUserId);
        });
        setMyTasksList(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTasks();
  }, [wsId, currentUserId, tasks]);

  const filteredTasks = myTasksList.filter((t) => {
    const matchesSearch = (t.title || '').toLowerCase().includes(search.toLowerCase());
    const isDone = t.column === 'done' || t.column === 'completed';
    const isInProgress = t.column === 'inprogress' || t.column === 'in_progress';
    const isTodo = t.column === 'todo';

    if (activeTab === 'completed') return matchesSearch && isDone;
    if (activeTab === 'inprogress') return matchesSearch && isInProgress;
    if (activeTab === 'todo') return matchesSearch && isTodo;
    return matchesSearch;
  });

  const handleToggleTaskStatus = async (task) => {
    const taskId = task._id || task.id;
    const isDone = task.column === 'done' || task.column === 'completed';
    const nextCol = isDone ? 'todo' : 'done';

    await moveTask(taskId, nextCol);
    setMyTasksList((prev) =>
      prev.map((t) => ((t._id || t.id) === taskId ? { ...t, column: nextCol } : t))
    );

    if (!isDone) {
      toast.success(`Completed "${task.title}"!`);
    }
  };

  const handleCreatePersonalTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetProject = activeProject?._id || projects[0]?._id || projects[0]?.id;
    if (!targetProject) {
      toast.error('Please create a project first before adding tasks.');
      return;
    }

    try {
      const newTask = await addTask({
        title: newTitle.trim(),
        priority: 'medium',
        column: 'todo',
        projectId: targetProject,
        assigneeIds: currentUserId ? [currentUserId] : undefined,
      });

      setMyTasksList((prev) => [newTask, ...prev]);
      setNewTitle('');
    } catch (err) {
      // Handled in context
    }
  };

  // Compute upcoming deadlines
  const upcomingDeadlines = myTasksList
    .filter((t) => t.dueDate && t.column !== 'done' && t.column !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs text-warm-500">
            Focused daily execution list &bull; Priority tracking and assignments across all workspace projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Task List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Create Task Form */}
          <form
            onSubmit={handleCreatePersonalTask}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-warm-200 shadow-warm-sm"
          >
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a new task and press Enter..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={Plus}
              disabled={!newTitle.trim()}
            >
              Add
            </Button>
          </form>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-200 pb-3">
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'all', label: `All (${myTasksList.length})` },
                { id: 'todo', label: 'To Do' },
                { id: 'inprogress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
              ]}
            />

            <div className="w-full sm:w-48">
              <Input
                leftIcon={Search}
                placeholder="Filter tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Task Items */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden divide-y divide-warm-100">
            {filteredTasks.map((task) => {
              const taskId = task._id || task.id;
              const isDone = task.column === 'done' || task.column === 'completed';

              return (
                <div
                  key={taskId}
                  className="p-3.5 flex items-center justify-between hover:bg-warm-50/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-sage-500 border-sage-500 text-white'
                          : 'border-warm-300 hover:border-warm-500'
                      }`}
                      aria-label="Toggle task status"
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-0.5 overflow-hidden">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isDone ? 'line-through text-warm-400' : 'text-warm-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-warm-500">
                        {task.projectId?.name && (
                          <span className="font-medium text-warm-700">
                            {task.projectId.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-warm-400" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="terracotta" size="sm">
                      {task.priority || 'medium'}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-warm-400 text-xs">
                No tasks found in this view.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widget: Upcoming Deadlines (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-warm-100 pb-3">
              <Calendar className="w-4 h-4 text-terracotta-500" />
              <h3 className="font-heading font-bold text-sm text-warm-900">
                Upcoming Deadlines
              </h3>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.map((t) => (
                <div
                  key={t._id || t.id}
                  className="p-3 rounded-xl bg-warm-50 border border-warm-100 space-y-1 text-xs"
                >
                  <p className="font-bold text-warm-900 line-clamp-1">{t.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-warm-500">
                    <span className="text-terracotta-600 font-semibold">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                    <Badge variant="mustard" size="sm">
                      {t.priority}
                    </Badge>
                  </div>
                </div>
              ))}

              {upcomingDeadlines.length === 0 && (
                <p className="text-xs text-warm-400 italic py-3 text-center">
                  No impending deadlines. You are all caught up!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
