import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Kanban, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Settings, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  FolderKanban,
  Trash2,
  Edit,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import projectService from '../services/projectService.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Avatar from '../components/common/Avatar.jsx';
import AvatarGroup from '../components/common/AvatarGroup.jsx';
import Tabs, { TabPanel } from '../components/common/Tabs.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Select from '../components/common/Select.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspace, projects, tasks, updateProject, deleteProject } = useApp();

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editDueDate, setEditDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const wsId = workspace?._id || workspace?.id;

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      try {
        const data = await projectService.getProjectById(id, wsId);
        setProject(data);
        setEditName(data.name || '');
        setEditDesc(data.description || '');
        setEditCover(data.coverImage || '');
        setEditStatus(data.status || 'active');
        setEditDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');

        // Fetch activity history
        const actData = await projectService.getProjectActivities(id, wsId);
        setActivities(actData || []);
      } catch (err) {
        // Fallback to local projects
        const fallback = projects.find((p) => (p._id || p.id) === id);
        if (fallback) setProject(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProjectDetails();
  }, [id, wsId, projects]);

  const currentProject = project || projects.find((p) => (p._id || p.id) === id) || projects[0];
  const pId = currentProject?._id || currentProject?.id || id;
  const projectTasks = tasks.filter((t) => (t.projectId?._id || t.projectId) === pId);

  const progressPercent =
    currentProject?.taskCount > 0
      ? Math.round(((currentProject.completedCount || 0) / currentProject.taskCount) * 100)
      : 0;

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateProject(pId, {
        name: editName.trim(),
        description: editDesc.trim(),
        coverImage: editCover.trim(),
        status: editStatus,
        dueDate: editDueDate || null,
      });
      setProject((prev) => ({ ...prev, ...updated }));
      setIsEditOpen(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(pId);
      setIsDeleteOpen(false);
      navigate('/projects');
    } catch (err) {
      // Handled in context
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentProject && isLoading) {
    return (
      <div className="py-20 text-center text-xs text-warm-400">
        Loading project details...
      </div>
    );
  }

  const memberList = (currentProject?.memberIds || []).map((m) => ({
    name: m.name || 'Member',
    avatar: m.avatarUrl || m.avatar,
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Projects', to: '/projects' },
          { label: currentProject?.name || 'Project Details' },
        ]}
      />

      {/* Project Banner Header */}
      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-warm-sm">
        {currentProject?.coverImage && (
          <div className="h-44 w-full bg-warm-100 overflow-hidden">
            <img
              src={currentProject.coverImage}
              alt={currentProject.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentProject?.color || '#E98269' }}
                />
                <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
                  {currentProject?.name}
                </h1>
                <Badge
                  variant={
                    currentProject?.status === 'completed'
                      ? 'sage'
                      : currentProject?.status === 'active'
                      ? 'terracotta'
                      : 'charcoal'
                  }
                  size="sm"
                >
                  {currentProject?.status || 'Active'}
                </Badge>
              </div>

              <p className="text-xs text-warm-500 max-w-2xl leading-relaxed">
                {currentProject?.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Edit}
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </Button>

              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>

              <Link to={`/board?project=${pId}`}>
                <Button variant="primary" size="sm" leftIcon={Kanban}>
                  Open Kanban Board
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-warm-100">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-warm-400 tracking-wider">
                Progress
              </p>
              <p className="text-base font-heading font-bold text-warm-900">
                {progressPercent}%
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-warm-400 tracking-wider">
                Tasks
              </p>
              <p className="text-base font-heading font-bold text-warm-900">
                {currentProject?.completedCount || 0} / {currentProject?.taskCount || 0}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-warm-400 tracking-wider">
                Due Date
              </p>
              <p className="text-base font-heading font-bold text-warm-900">
                {currentProject?.dueDate
                  ? new Date(currentProject.dueDate).toLocaleDateString()
                  : 'Flexible'}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-warm-400 tracking-wider">
                Lead / Assignees
              </p>
              <div className="pt-0.5">
                {memberList.length > 0 ? (
                  <AvatarGroup users={memberList} max={4} size="xs" />
                ) : (
                  <span className="text-xs text-warm-500">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Tasks vs Activity History */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: `Tasks (${projectTasks.length})` },
          { id: 'activities', label: `Activity History (${activities.length})` },
        ]}
      />

      {/* TAB 1: TASKS */}
      <TabPanel id="overview" activeTab={activeTab}>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-warm-sm">
            <div className="divide-y divide-warm-100">
              {projectTasks.map((t) => (
                <div
                  key={t._id || t.id}
                  className="p-4 flex items-center justify-between hover:bg-warm-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-warm-900">{t.title}</h4>
                    <p className="text-[11px] text-warm-500 line-clamp-1">
                      {t.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="terracotta" size="sm">
                      {t.priority}
                    </Badge>
                    <Badge variant="charcoal" size="sm">
                      {t.column}
                    </Badge>
                  </div>
                </div>
              ))}

              {projectTasks.length === 0 && (
                <div className="py-12 text-center text-warm-400 text-xs">
                  No tasks added to this project yet. Open the Kanban board to create tasks.
                </div>
              )}
            </div>
          </div>
        </div>
      </TabPanel>

      {/* TAB 2: AUDIT ACTIVITY HISTORY */}
      <TabPanel id="activities" activeTab={activeTab}>
        <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-warm-100 pb-3">
            <Activity className="w-4 h-4 text-terracotta-500" />
            <h3 className="font-heading font-bold text-sm text-warm-900">
              Project Audit Log
            </h3>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3 p-3 rounded-xl bg-warm-50/50 border border-warm-100 text-xs"
              >
                <Avatar
                  src={act.actorId?.avatarUrl}
                  name={act.actorId?.name || 'System'}
                  size="sm"
                />
                <div className="space-y-0.5 flex-1">
                  <p className="text-warm-800">
                    <strong className="text-warm-900">{act.actorId?.name || 'User'}</strong>{' '}
                    performed <span className="font-mono text-terracotta-700 font-bold">{act.action}</span>
                  </p>
                  <p className="text-[10px] text-warm-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="py-8 text-center text-warm-400 text-xs">
                No activity logs recorded for this project yet.
              </div>
            )}
          </div>
        </div>
      </TabPanel>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project Details"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
          <Input
            label="Project Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Cover Image URL"
              value={editCover}
              onChange={(e) => setEditCover(e.target.value)}
            />

            <Input
              label="Target Due Date"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>

          <Select
            label="Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-warm-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project?"
        message={`Are you sure you want to delete "${currentProject?.name}"? All associated tasks will be archived.`}
        confirmText="Delete Project"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectDetailsPage;
