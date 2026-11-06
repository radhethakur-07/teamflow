import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetProjId = projectId || (activeProject?._id || activeProject?.id);

    setIsLoading(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        projectId: targetProjId,
        assigneeIds: assigneeId ? [assigneeId] : undefined,
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    value: p._id || p.id,
    label: p.name,
  }));

  const memberOptions = [
    { value: '', label: 'Unassigned (Self)' },
    ...members.map((m) => {
      const u = m.user || m;
      return {
        value: u._id || u.id,
        label: `${u.name} (${u.email})`,
      };
    }),
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
