import React, { useState } from 'react';
import { Plus, Search, FolderKanban, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import ProjectCard from '../components/domain/ProjectCard.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Modal from '../components/common/Modal.jsx';
import Select from '../components/common/Select.jsx';
import Textarea from '../components/common/Textarea.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ProjectsPage = () => {
  const { projects, addProject, teams, members } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState('#E98269');
  const [teamId, setTeamId] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'active') return matchesSearch && p.status === 'active';
    if (activeTab === 'completed') return matchesSearch && p.status === 'completed';
    if (activeTab === 'archived') return matchesSearch && p.status === 'archived';
    return matchesSearch;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await addProject({
        name: name.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        dueDate: dueDate || null,
        color,
        teamId: teamId || null,
        status: 'active',
      });

      setName('');
      setDescription('');
      setCoverImage('');
      setDueDate('');
      setTeamId('');
      setIsModalOpen(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsCreating(false);
    }
  };

  const projectColorOptions = [
    { label: 'Terracotta', color: '#E98269' },
    { label: 'Sage', color: '#91A88C' },
    { label: 'Mustard', color: '#E9C995' },
    { label: 'Lavender', color: '#C9B8D9' },
    { label: 'Charcoal', color: '#554B43' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-warm-500">
            Manage your team's initiatives, sprint cycles, and client deliverables.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200 pb-4">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'all', label: `All (${projects.length})` },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'archived', label: 'Archived' },
          ]}
        />

        <div className="w-full sm:w-64">
          <Input
            leftIcon={Search}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => (
          <ProjectCard key={project._id || project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first team project to start organizing tasks, boards, and deliverables."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        description="Set up a workspace project with its own board, tasks, and deadlines."
        maxWidth="md"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Design System 2.0"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="Describe the project mission, target audience, and key deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />

            <Input
              label="Target Due Date (Optional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {teams.length > 0 && (
            <Select
              label="Assign to Team (Optional)"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              options={[
                { value: '', label: 'No specific team' },
                ...teams.map((t) => ({ value: t._id || t.id, label: t.name })),
              ]}
            />
          )}

          {/* Color Tag Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-700">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2">
              {projectColorOptions.map((opt) => (
                <button
                  key={opt.color}
                  type="button"
                  onClick={() => setColor(opt.color)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    color === opt.color ? 'ring-2 ring-warm-900 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
