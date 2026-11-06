import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  ChevronDown, 
  CheckSquare, 
  Calendar, 
  User, 
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TaskCard from '../components/domain/TaskCard.jsx';
import Drawer from '../components/common/Drawer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';
import NewTaskModal from '../components/domain/NewTaskModal.jsx';

export const KanbanBoardPage = () => {
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    tasks, 
    moveTask, 
    toggleChecklistItem,
    currentUser 
  } = useApp();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [mockComments, setMockComments] = useState([
    { id: 'c-1', author: 'Alex Rivera', text: 'Confirmed the contrast ratio on warm ivory meets 4.8:1 AA standard.', time: '20m ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    { id: 'c-2', author: 'Jane Doe', text: 'Great! Moving this card to In Review for team sign-off.', time: '5m ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' }
  ]);

  const columns = [
    { id: 'col-todo', title: 'To Do', color: '#73665C' },
    { id: 'col-inprogress', title: 'In Progress', color: '#E9C995' },
    { id: 'col-review', title: 'In Review', color: '#C9B8D9' },
    { id: 'col-done', title: 'Done', color: '#91A88C' },
  ];

  const currentProjectTasks = tasks.filter((t) => {
    const matchesProject = t.projectId === activeProject.id;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesProject && matchesSearch && matchesPriority;
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setMockComments([
      ...mockComments,
      {
        id: `c-${Date.now()}`,
        author: currentUser.name,
        text: commentText.trim(),
        time: 'Just now',
        avatar: currentUser.avatar,
      }
    ]);
    setCommentText('');
  };

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedTask) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };

    selectedTask.checklist = [...(selectedTask.checklist || []), newItem];
    setNewChecklistText('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Board Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-warm-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center flex-shrink-0 shadow-warm-sm">
            <Kanban className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <select
                value={activeProject.id}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) setActiveProject(found);
                }}
                className="font-heading font-extrabold text-xl text-warm-900 bg-transparent border-none focus:outline-none cursor-pointer hover:text-terracotta-600 transition-colors tracking-tight pr-6"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} Board
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-warm-500">
              Real-time collaboration board &bull; Sub-100ms multi-user sync
            </p>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-48 sm:w-56">
            <Input
              leftIcon={Search}
              placeholder="Filter cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-warm-300 rounded-lg py-2 px-3 text-warm-700 focus:outline-none focus:ring-2 focus:ring-terracotta-200 shadow-warm-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start overflow-x-auto pb-4">
        {columns.map((column) => {
          const colTasks = currentProjectTasks.filter((t) => t.columnId === column.id);

          return (
            <div
              key={column.id}
              className="bg-warm-100/70 rounded-2xl border border-warm-200/90 p-4 space-y-3.5 min-h-[500px] flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-heading font-bold text-sm text-warm-900">
                      {column.title}
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-warm-600 bg-warm-200 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                {/* Card Stack */}
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columns={columns}
                      onClick={() => setSelectedTask(task)}
                      onMove={(taskId, targetColId) => moveTask(taskId, targetColId)}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="border border-dashed border-warm-300 rounded-xl p-8 text-center text-xs text-warm-400">
                      No tasks in {column.title}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Card Footer */}
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-warm-300 hover:border-terracotta-400 text-xs font-semibold text-warm-500 hover:text-terracotta-600 hover:bg-white/60 transition-all flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task to {column.title}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Task Detail Slide-out Drawer */}
      <Drawer
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title}
        subtitle={`${activeProject.name} &bull; ${selectedTask?.priority?.toUpperCase()} Priority`}
        width="md"
      >
        {selectedTask && (
          <div className="space-y-6 text-left">
            {/* Column Switcher */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-warm-50 border border-warm-200">
              <span className="text-xs font-semibold text-warm-600">Workflow Column</span>
              <select
                value={selectedTask.columnId}
                onChange={(e) => {
                  moveTask(selectedTask.id, e.target.value);
                  setSelectedTask({ ...selectedTask, columnId: e.target.value });
                }}
                className="text-xs bg-white border border-warm-300 rounded-lg py-1.5 px-3 text-warm-800 font-semibold focus:outline-none"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-400">
                Description
              </span>
              <p className="text-xs text-warm-700 leading-relaxed bg-white p-3.5 rounded-xl border border-warm-200">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Interactive Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-warm-400">
                  Checklist Items ({selectedTask.checklist?.filter((c) => c.completed).length || 0}/{selectedTask.checklist?.length || 0})
                </span>
              </div>

              <div className="space-y-2">
                {(selectedTask.checklist || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-warm-200 bg-white shadow-warm-sm flex items-center justify-between gap-3 text-xs"
                  >
                    <Checkbox
                      label={item.text}
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(selectedTask.id, item.id)}
                    />
                  </div>
                ))}

                {/* Add checklist input */}
                <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add checklist item..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                  />
                  <Button variant="secondary" size="sm" type="submit" leftIcon={Plus}>
                    Add
                  </Button>
                </form>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-4 border-t border-warm-200">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-400">
                Discussion & Activity
              </span>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {mockComments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar src={c.avatar} name={c.author} size="xs" />
                        <span className="font-bold text-warm-900">{c.author}</span>
                      </div>
                      <span className="text-[10px] text-warm-400">{c.time}</span>
                    </div>
                    <p className="text-xs text-warm-700 pl-6 leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <Input
                  placeholder="Leave a comment or update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button variant="primary" size="sm" type="submit" leftIcon={Send}>
                  Post
                </Button>
              </form>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </div>
  );
};

export default KanbanBoardPage;
