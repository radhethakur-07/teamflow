import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Kanban, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Settings, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  FolderKanban
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Avatar, { AvatarGroup } from '../components/common/Avatar.jsx';
import Tabs from '../components/common/Tabs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { projects, tasks } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const project = projects.find((p) => p.id === id) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const progressPercent = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Projects', to: '/projects' },
          { label: project.name },
        ]}
      />

      {/* Project Banner Header */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-warm-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
                {project.name}
              </h1>
              <Badge variant={project.status === 'active' ? 'sage' : 'charcoal'} size="sm">
                {project.status === 'active' ? 'Active Project' : 'Archived'}
              </Badge>
            </div>

            <p className="text-xs text-warm-500 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/board">
              <Button variant="primary" size="sm" leftIcon={Kanban}>
                Open Kanban Board
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Meta Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-warm-100 text-xs text-warm-600">
          <div>
            <span className="text-[10px] uppercase font-bold text-warm-400 block">Project Lead</span>
            <span className="font-bold text-warm-800">{project.lead?.name || 'Jane Doe'}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-warm-400 block">Due Date</span>
            <span className="font-bold text-warm-800">{project.dueDate}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-warm-400 block">Team Members</span>
            <AvatarGroup users={project.members || []} max={4} size="xs" className="mt-1" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-warm-400 block">Task Throughput</span>
            <span className="font-bold text-sage-600">{project.completedCount} / {project.taskCount} ({progressPercent}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: project.color || '#E98269',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview & Milestones' },
          { id: 'tasks', label: 'Tasks in Flight', badge: projectTasks.length },
          { id: 'team', label: 'Assigned Team', badge: project.members?.length || 0 },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-warm-200 p-6 shadow-warm-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-warm-900">
              Sprint Roadmap & Deliverables
            </h3>
            <div className="space-y-3 text-xs text-warm-600">
              <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-sage-500" />
                  <div>
                    <p className="font-bold text-warm-900">Milestone 1: Architectural Foundation</p>
                    <p className="text-[11px] text-warm-400">Completed on Nov 6 &bull; Verified 0 errors</p>
                  </div>
                </div>
                <Badge variant="sage" size="sm">Passed</Badge>
              </div>

              <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-mustard-500" />
                  <div>
                    <p className="font-bold text-warm-900">Milestone 2: Frontend Visual Foundation</p>
                    <p className="text-[11px] text-warm-400">Warm editorial theme &bull; 15 core pages active</p>
                  </div>
                </div>
                <Badge variant="mustard" size="sm">In Progress</Badge>
              </div>

              <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-warm-300" />
                  <div>
                    <p className="font-bold text-warm-900">Milestone 3: Real-Time Sockets & Kanban Engine</p>
                    <p className="text-[11px] text-warm-400">Socket.IO rooms & fractional ordering sync</p>
                  </div>
                </div>
                <Badge variant="charcoal" size="sm">Upcoming</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-warm-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-warm-900">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to="/board" className="block">
                <Button variant="primary" size="sm" className="w-full" leftIcon={Kanban}>
                  Go to Kanban Board
                </Button>
              </Link>
              <Link to="/members" className="block">
                <Button variant="secondary" size="sm" className="w-full" leftIcon={Users}>
                  Manage Project Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {projectTasks.length > 0 ? (
            <div className="divide-y divide-warm-100 bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-warm-sm">
              {projectTasks.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={t.priority === 'urgent' ? 'terracotta' : 'mustard'} size="sm">
                        {t.priority}
                      </Badge>
                      <span className="font-mono text-warm-400 text-[10px]">Due: {t.dueDate}</span>
                    </div>
                    <p className="font-heading font-bold text-sm text-warm-900">{t.title}</p>
                  </div>
                  <Link to="/board">
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No tasks in this project"
              description="Start by adding tasks directly to this project's workflow board."
            />
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(project.members || []).map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-warm-200 p-4 shadow-warm-sm flex items-center gap-3">
              <Avatar src={m.avatar} name={m.name} size="md" status="online" />
              <div className="text-left">
                <p className="text-xs font-bold text-warm-900">{m.name}</p>
                <p className="text-[11px] text-warm-400">{m.roleTitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
