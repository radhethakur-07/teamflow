import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const MyTasksPage = () => {
  const { tasks, addTask, moveTask } = useApp();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'completed') return matchesSearch && t.columnId === 'col-done';
    if (activeTab === 'inprogress') return matchesSearch && t.columnId === 'col-inprogress';
    if (activeTab === 'todo') return matchesSearch && t.columnId === 'col-todo';
    return matchesSearch;
  });

  const handleToggleTaskStatus = (task) => {
    const isDone = task.columnId === 'col-done';
    const nextCol = isDone ? 'col-todo' : 'col-done';
    moveTask(task.id, nextCol);
    if (!isDone) {
      toast.success(`Completed "${task.title}"! Great work.`);
    }
  };

  const handleCreatePersonalTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      columnId: 'col-todo',
    });
    setNewTitle('');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs text-warm-500">
            Focused daily execution list &bull; Priority tracking and personal action items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sage" size="md">
            {tasks.filter((t) => t.columnId === 'col-done').length} Completed
          </Badge>
          <Badge variant="terracotta" size="md">
            {tasks.filter((t) => t.columnId !== 'col-done').length} Pending
          </Badge>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleCreatePersonalTask}
        className="flex gap-2 p-2 bg-white rounded-2xl border border-warm-200 shadow-warm-sm"
      >
        <Input
          placeholder="What do you need to accomplish today? (Press Enter to add)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border-none shadow-none focus:ring-0"
        />
        <Button variant="primary" size="sm" type="submit" leftIcon={Plus}>
          Add
        </Button>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Tasks', badge: tasks.length },
            { id: 'todo', label: 'To Do', badge: tasks.filter((t) => t.columnId === 'col-todo').length },
            { id: 'inprogress', label: 'In Progress', badge: tasks.filter((t) => t.columnId === 'col-inprogress').length },
            { id: 'completed', label: 'Done', badge: tasks.filter((t) => t.columnId === 'col-done').length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
        />

        <div className="w-full sm:w-64">
          <Input
            leftIcon={Search}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm divide-y divide-warm-100 overflow-hidden">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.columnId === 'col-done';

            return (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-warm-50/70 transition-colors group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Functional Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-sage-500 border-sage-500 text-white'
                        : 'bg-white border-warm-300 hover:border-warm-500 text-transparent'
                    }`}
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-0.5 truncate">
                    <p
                      className={`text-sm font-heading font-semibold transition-all truncate ${
                        isCompleted
                          ? 'line-through text-warm-400'
                          : 'text-warm-900 group-hover:text-terracotta-600'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-warm-400">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </span>
                      )}
                      <span>&bull;</span>
                      <span className="capitalize">{task.columnId.replace('col-', '')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'terracotta'
                        : task.priority === 'high'
                        ? 'mustard'
                        : task.priority === 'medium'
                        ? 'lavender'
                        : 'charcoal'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10">
            <EmptyState
              icon={CheckSquare}
              title="No tasks match this filter"
              description="You're either all caught up, or no tasks fit the current criteria."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
