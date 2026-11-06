import React, { useState } from 'react';
import { Plus, Search, FolderKanban, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import ProjectCard from '../components/domain/ProjectCard.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Modal from '../components/common/Modal.jsx';
import Textarea from '../components/common/Textarea.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ProjectsPage = () => {
  const { projects, addProject } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#E98269');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'active') return matchesSearch && p.status === 'active';
    if (activeTab === 'archived') return matchesSearch && p.status === 'archived';
    return matchesSearch;
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      name: name.trim(),
      description: description.trim(),
      color,
      status: 'active',
    });

    setName('');
    setDescription('');
    setIsModalOpen(false);
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Projects', badge: projects.length },
            { id: 'active', label: 'Active', badge: projects.filter((p) => p.status === 'active').length },
            { id: 'archived', label: 'Archived', badge: projects.filter((p) => p.status === 'archived').length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
        />

        <div className="w-full sm:w-72">
          <Input
            leftIcon={Search}
            placeholder="Search projects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={`No project matched your filter "${search || activeTab}". Try adjusting your query or create a new one.`}
          actionLabel="Create New Project"
          actionIcon={Plus}
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        description="Set up a workspace initiative and auto-seed default Kanban columns."
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
            placeholder="What is the goal of this project?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Color Tag Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-700">
              Project Accent Color
            </label>
            <div className="flex items-center gap-3">
              {projectColorOptions.map((opt) => (
                <button
                  key={opt.color}
                  type="button"
                  onClick={() => setColor(opt.color)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === opt.color ? 'scale-110 ring-2 ring-warm-800 ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
