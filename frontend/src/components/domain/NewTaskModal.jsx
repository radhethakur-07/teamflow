import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Textarea from '../common/Textarea.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';

export const NewTaskModal = ({ isOpen, onClose }) => {
  const { projects, addTask, activeProject } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState(activeProject?.id || projects[0]?.id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectId,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      description="Add a task to your project workflow board."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Design tactile empty state illustrations"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
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

        <Input
          type="date"
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add context, acceptance criteria, or design notes..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;
