import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Textarea from '../common/Textarea.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';

export const NewTaskModal = ({ isOpen, onClose }) => {
  const { projects, addTask, activeProject, members } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState(
    activeProject?._id || activeProject?.id || (projects[0] ? projects[0]._id || projects[0].id : '')
  );
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize default selected project whenever modal opens or active project/projects list updates
  useEffect(() => {
    if (isOpen) {
      const currentValid = projectId && projects.some((p) => (p._id || p.id) === projectId);
      if (!currentValid) {
        const fallbackId =
          activeProject?._id ||
          activeProject?.id ||
          (projects[0] ? projects[0]._id || projects[0].id : '');
        if (fallbackId) setProjectId(fallbackId);
      }
    }
  }, [isOpen, activeProject, projects, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetProjId =
      projectId ||
      activeProject?._id ||
      activeProject?.id ||
      (projects[0] ? projects[0]._id || projects[0].id : '');

    // Clean and validate assignee ID ensuring 24-character hex format
    const cleanedAssigneeIds =
      assigneeId && /^[0-9a-fA-F]{24}$/.test(assigneeId) ? [assigneeId] : undefined;

    setIsLoading(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority: priority.toLowerCase(),
        dueDate: dueDate || null,
        projectId: targetProjId,
        assigneeIds: cleanedAssigneeIds,
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      onClose();
    } catch (err) {
      console.error('[CreateTask Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    value: (p._id || p.id).toString(),
    label: p.name,
  }));

  const memberOptions = [
    { value: '', label: 'Unassigned (Self)' },
    ...members
      .map((m) => {
        const u = m.user || m;
        const id = u?._id || u?.id;
        const name = u?.name || m?.name || 'Member';
        const email = u?.email || m?.email || '';
        return {
          value: id ? id.toString() : '',
          label: email ? `${name} (${email})` : name,
        };
      })
      .filter((opt) => opt.value),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a task to your project workflow board."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Task Title"
          placeholder="e.g. Implement heartbeat timeout event handler"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Project"
            value={projectId || (activeProject?._id || activeProject?.id || '')}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Due Date (Optional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={memberOptions}
          />
        </div>

        <Textarea
          label="Description (Optional)"
          placeholder="Add acceptance criteria, technical details, or notes..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;
