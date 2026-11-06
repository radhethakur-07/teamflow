import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  FolderKanban, 
  CheckSquare, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Users,
  CheckCircle2,
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import StatWidget from '../components/domain/StatWidget.jsx';
import ProjectCard from '../components/domain/ProjectCard.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';

export const DashboardPage = () => {
  const { onOpenNewTask } = useOutletContext() || {};
  const { currentUser, projects, tasks, members, workspace } = useApp();

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const completedTasksCount = tasks.filter(
    (t) => t.column === 'done' || t.column === 'completed'
  ).length;
  const inProgressTasksCount = tasks.filter(
    (t) => t.column === 'inprogress' || t.column === 'in_progress'
  ).length;
  const urgentTasks = tasks
    .filter((t) => t.priority === 'urgent' || t.priority === 'high')
    .slice(0, 4);

  const displayName = currentUser?.name || 'Workspace Member';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-warm-900 tracking-tight">
              Good afternoon, {firstName}
            </h1>
            <Badge variant="terracotta" size="sm">
              {workspace?.name || 'Workspace'}
            </Badge>
          </div>
          <p className="text-xs text-warm-500">
            Real-time status and throughput across your active team initiatives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="secondary" size="sm" leftIcon={FolderKanban}>
              View All Projects
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={onOpenNewTask}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          title="Active Projects"
          value={activeProjectsCount}
          change="+1 this month"
          trend="up"
          color="terracotta"
          icon={FolderKanban}
        />
        <StatWidget
          title="In Progress"
          value={inProgressTasksCount}
          change="Across projects"
          trend="neutral"
          color="mustard"
          icon={TrendingUp}
        />
        <StatWidget
          title="Completed Tasks"
          value={completedTasksCount}
          change="Sprint throughput"
          trend="up"
          color="sage"
          icon={CheckCircle2}
        />
        <StatWidget
          title="Team Roster"
          value={members.length}
          change="Active members"
          trend="neutral"
          color="lavender"
          icon={Users}
        />
      </div>

      {/* Active Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-heading font-bold text-warm-900 tracking-tight">
              Active Projects
            </h2>
            <p className="text-xs text-warm-500">
              High-priority initiatives currently in flight.
            </p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
          >
            <span>Browse all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p._id || p.id} project={p} />
          ))}

          {projects.length === 0 && (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-warm-200 text-xs text-warm-400">
              No projects created yet. Click "New Project" to start.
            </div>
          )}
        </div>
      </div>

      {/* Priority Action Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-heading font-bold text-warm-900 tracking-tight">
              High Priority Tasks
            </h2>
            <p className="text-xs text-warm-500">
              Urgent and high-priority action items requiring team attention.
            </p>
          </div>

          <Link
            to="/board"
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
          >
            <span>Open Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 divide-y divide-warm-100 shadow-warm-sm overflow-hidden">
          {urgentTasks.map((t) => (
            <div
              key={t._id || t.id}
              className="p-4 flex items-center justify-between hover:bg-warm-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="terracotta" size="sm">
                    {t.priority}
                  </Badge>
                  <span className="text-xs font-bold text-warm-900">
                    {t.title}
                  </span>
                </div>
                <p className="text-[11px] text-warm-500 line-clamp-1">
                  {t.description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="charcoal" size="sm">
                  {t.column}
                </Badge>
              </div>
            </div>
          ))}

          {urgentTasks.length === 0 && (
            <div className="py-8 text-center text-warm-400 text-xs">
              No urgent tasks pending. Everything is on schedule!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
