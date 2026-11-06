import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  CheckCircle2,
  Trash2,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import taskService from '../services/taskService.js';
import TaskCard from '../components/domain/TaskCard.jsx';
import Drawer from '../components/common/Drawer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';
import NewTaskModal from '../components/domain/NewTaskModal.jsx';

export const KanbanBoardPage = () => {
  const [searchParams] = useSearchParams();
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    tasks, 
    moveTask, 
    deleteTask,
    addChecklistItem,
    toggleChecklistItem,
    workspace,
    currentUser 
  } = useApp();

  const { joinRoom, leaveRoom, socket } = useSocket();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [taskComments, setTaskComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Sync active project from query param if provided
  useEffect(() => {
    const queryProjId = searchParams.get('project');
    if (queryProjId && projects.length > 0) {
      const match = projects.find((p) => (p._id || p.id) === queryProjId);
      if (match) setActiveProject(match);
    }
  }, [searchParams, projects, setActiveProject]);

  // Join project real-time socket room
  useEffect(() => {
    const projId = activeProject?._id || activeProject?.id;
    if (projId) {
      joinRoom(`project:${projId}`);
      return () => {
        leaveRoom(`project:${projId}`);
      };
    }
  }, [activeProject, joinRoom, leaveRoom]);

  // Real-time task comments listener
  useEffect(() => {
    if (!socket || !selectedTask) return;

    const handleNewComment = ({ taskId, comment }) => {
      const selectedId = selectedTask._id || selectedTask.id;
      if (taskId === selectedId) {
        setTaskComments((prev) => {
          if (prev.some((c) => (c._id || c.id) === (comment._id || comment.id))) return prev;
          return [...prev, comment];
        });
      }
    };

    socket.on('comment:created', handleNewComment);
    return () => {
      socket.off('comment:created', handleNewComment);
    };
  }, [socket, selectedTask]);

  // Load comments when selected task opens
  useEffect(() => {
    const loadComments = async () => {
      if (!selectedTask) {
        setTaskComments([]);
        return;
      }
      const tId = selectedTask._id || selectedTask.id;
      const wsId = workspace?._id || workspace?.id;
      setIsLoadingComments(true);
      try {
        const comments = await taskService.getComments(tId, wsId);
        setTaskComments(comments || []);
      } catch (err) {
        console.error('Failed to load task comments', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [selectedTask, workspace]);

  const columns = [
    { id: 'todo', key: 'todo', title: 'To Do', color: '#73665C' },
    { id: 'inprogress', key: 'inprogress', title: 'In Progress', color: '#E9C995' },
    { id: 'review', key: 'review', title: 'In Review', color: '#C9B8D9' },
    { id: 'done', key: 'done', title: 'Completed', color: '#91A88C' },
  ];

  const currentProjectId = activeProject?._id || activeProject?.id;

  const currentProjectTasks = tasks.filter((t) => {
    const pId = t.projectId?._id || t.projectId;
    const matchesProject = !currentProjectId || pId === currentProjectId;
    const matchesSearch =
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesProject && matchesSearch && matchesPriority;
  });

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    const tId = selectedTask._id || selectedTask.id;
    const wsId = workspace?._id || workspace?.id;
    setIsPostingComment(true);

    try {
      const newComment = await taskService.addComment(tId, commentText.trim(), wsId);
      setTaskComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedTask) return;

    const tId = selectedTask._id || selectedTask.id;
    try {
      const newItem = await addChecklistItem(tId, newChecklistText.trim());
      setSelectedTask((prev) => ({
        ...prev,
        checklist: [...(prev.checklist || []), newItem],
      }));
      setNewChecklistText('');
    } catch (err) {
      console.error('Failed to add checklist item', err);
    }
  };

  const handleToggleChecklist = async (itemId) => {
    if (!selectedTask) return;
    const tId = selectedTask._id || selectedTask.id;
    const updated = await toggleChecklistItem(tId, itemId);
    setSelectedTask((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((c) =>
        (c._id || c.id) === itemId ? { ...c, completed: updated.completed } : c
      ),
    }));
  };

  const handleDeleteSelectedTask = async () => {
    if (!selectedTask) return;
    const tId = selectedTask._id || selectedTask.id;
    await deleteTask(tId);
    setSelectedTask(null);
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
                value={currentProjectId || ''}
                onChange={(e) => {
                  const found = projects.find(
                    (p) => (p._id || p.id) === e.target.value
                  );
                  if (found) setActiveProject(found);
                }}
                className="font-heading font-extrabold text-xl text-warm-900 bg-transparent border-none focus:outline-none cursor-pointer hover:text-terracotta-600 transition-colors tracking-tight pr-6"
              >
                {projects.map((p) => {
                  const pId = p._id || p.id;
                  return (
                    <option key={pId} value={pId}>
                      {p.name} Board
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-warm-500">
              Drag and drop tasks between workflow stages with instant persistence
            </p>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-48 sm:w-56">
            <Input
              leftIcon={Search}
              placeholder="Search tasks..."
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
          const colTasks = currentProjectTasks.filter((t) => {
            const c = t.column || 'todo';
            if (column.key === 'todo') return c === 'todo';
            if (column.key === 'inprogress') return c === 'inprogress' || c === 'in_progress';
            if (column.key === 'review') return c === 'review' || c === 'in_review';
            if (column.key === 'done') return c === 'done' || c === 'completed';
            return c === column.key;
          });

          return (
            <div
              key={column.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) {
                  moveTask(taskId, column.key);
                }
              }}
              className="bg-warm-100/70 rounded-2xl border border-warm-200/90 p-4 space-y-3.5 min-h-[520px] flex flex-col justify-between transition-colors hover:bg-warm-100"
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
                  {colTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div
                        key={taskId}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', taskId);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <TaskCard
                          task={task}
                          columns={columns}
                          onClick={() => setSelectedTask(task)}
                          onMove={(tId, targetColKey) => moveTask(tId, targetColKey)}
                        />
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-warm-200/70 rounded-xl text-center text-xs text-warm-400">
                      Drag tasks here
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Column Add Button */}
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(true)}
                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-warm-500 hover:text-warm-900 hover:bg-warm-200/50 rounded-xl transition-colors border border-dashed border-warm-300/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Task Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Details'}
        description={`In column: ${selectedTask?.column?.toUpperCase()}`}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6 text-left">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-warm-200">
              <Badge variant="terracotta" size="md">
                Priority: {selectedTask.priority?.toUpperCase()}
              </Badge>

              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={handleDeleteSelectedTask}
              >
                Delete Task
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-warm-900 uppercase tracking-wider">
                Description
              </label>
              <p className="text-xs text-warm-700 bg-warm-50 p-3.5 rounded-xl border border-warm-200 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-warm-500" />
                  <h4 className="text-xs font-heading font-bold text-warm-900 uppercase tracking-wider">
                    Subtasks / Checklist
                  </h4>
                </div>
                <span className="text-xs text-warm-500">
                  {(selectedTask.checklist || []).filter((c) => c.completed).length} /{' '}
                  {(selectedTask.checklist || []).length} done
                </span>
              </div>

              <div className="space-y-1.5">
                {(selectedTask.checklist || []).map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-warm-50 border border-warm-200 text-xs"
                    >
                      <Checkbox
                        label={item.title || item.text}
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(itemId)}
                      />
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                <Input
                  placeholder="Add a new checklist item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Add
                </Button>
              </form>
            </div>

            {/* Real Comments Feed */}
            <div className="space-y-3 pt-3 border-t border-warm-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-warm-500" />
                <h4 className="text-xs font-heading font-bold text-warm-900 uppercase tracking-wider">
                  Discussion ({taskComments.length})
                </h4>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {taskComments.map((c) => (
                  <div
                    key={c._id || c.id}
                    className="p-3 rounded-xl bg-warm-50 border border-warm-100 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-warm-500 text-[11px]">
                      <span className="font-bold text-warm-900">
                        {c.authorId?.name || 'Collaborator'}
                      </span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-warm-700">{c.content}</p>
                  </div>
                ))}

                {taskComments.length === 0 && !isLoadingComments && (
                  <p className="text-xs text-warm-400 italic py-2">
                    No comments yet. Start the conversation below.
                  </p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  rightIcon={Send}
                  isLoading={isPostingComment}
                >
                  Send
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
