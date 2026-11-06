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
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import StatWidget from '../components/domain/StatWidget.jsx';
import ProjectCard from '../components/domain/ProjectCard.jsx';
import TaskCard from '../components/domain/TaskCard.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';

export const DashboardPage = () => {
  const { onOpenNewTask } = useOutletContext() || {};
  const { currentUser, projects, tasks, workspace, moveTask } = useApp();

  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').slice(0, 3);

  const activities = [
    { id: 'act-1', user: 'Alex Rivera', action: 'moved task', target: 'Implement Terracotta button variants', to: 'In Progress', time: '12m ago' },
    { id: 'act-2', user: 'Jane Doe', action: 'completed checklist in', target: 'Setup Vite monorepo', to: 'Done', time: '1h ago' },
    { id: 'act-3', user: 'Maya Lin', action: 'created project', target: 'Customer Onboarding Revamp', to: '', time: '3h ago' },
    { id: 'act-4', user: 'David Chen', action: 'commented on', target: 'Prototype drag-and-drop animations', to: '', time: '5h ago' },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-warm-900 tracking-tight">
              Good afternoon, {currentUser.name.split(' ')[0]}
            </h1>
            <Badge variant="terracotta" size="sm">Workspace Owner</Badge>
          </div>
          <p className="text-xs text-warm-500">
            Here's what's happening across <strong className="text-warm-800">{workspace.name}</strong> today.
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
            Create Task
          </Button>
        </div>
      </div>

      {/* 4 Spacious Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          title="Active Tasks"
          value={tasks.length}
          trend="+14%"
          trendLabel="vs last sprint"
          icon={CheckSquare}
          variant="terracotta"
        />
        <StatWidget
          title="Projects in Flight"
          value={projects.length}
          trend="+1 new"
          trendLabel="this month"
          icon={FolderKanban}
          variant="sage"
        />
        <StatWidget
          title="Sprint Velocity"
          value="87%"
          trend="+5%"
          trendLabel="completion rate"
          icon={TrendingUp}
          variant="mustard"
        />
        <StatWidget
          title="Upcoming Deadlines"
          value="3 Tasks"
          trend="Due in 48h"
          trendLabel="requires attention"
          icon={Clock}
          variant="lavender"
        />
      </div>

      {/* Main Grid: Active Projects & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-heading font-bold text-warm-900">
                Active Projects
              </h2>
              <Badge variant="charcoal" size="sm">{projects.length}</Badge>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          {/* Urgent Tasks Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-terracotta-500" />
                <h3 className="text-base font-heading font-bold text-warm-900">
                  Priority Tasks Requiring Attention
                </h3>
              </div>
              <Link
                to="/my-tasks"
                className="text-xs font-semibold text-warm-500 hover:text-warm-800"
              >
                View all my tasks
              </Link>
            </div>

            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-warm-200 p-4 shadow-warm-sm hover:border-warm-300 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={task.priority === 'urgent' ? 'terracotta' : 'mustard'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-warm-400 font-mono">
                        Due: {task.dueDate}
                      </span>
                    </div>
                    <Link
                      to="/board"
                      className="text-sm font-heading font-semibold text-warm-900 hover:text-terracotta-600 transition-colors block"
                    >
                      {task.title}
                    </Link>
                  </div>

                  <Link to="/board">
                    <Button variant="ghost" size="sm">
                      Open Board
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team Activity Stream & Workspace Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-warm-200 p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h3 className="font-heading font-bold text-sm text-warm-900">
                Team Activity Stream
              </h3>
              <Badge variant="sage" size="sm" dot>Live</Badge>
            </div>

            <div className="divide-y divide-warm-100">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sage-500 mt-1.5 flex-shrink-0" />
                  <div className="space-y-0.5 leading-snug">
                    <p className="text-warm-800">
                      <strong className="text-warm-900 font-bold">{act.user}</strong> {act.action}{' '}
                      <strong className="text-warm-900 font-medium">"{act.target}"</strong>
                      {act.to && <span className="text-terracotta-600 font-semibold"> &rarr; {act.to}</span>}
                    </p>
                    <p className="text-[10px] text-warm-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/board"
              className="block text-center text-xs font-semibold text-terracotta-600 hover:underline pt-2"
            >
              Open Live Board Stream &rarr;
            </Link>
          </div>

          {/* Quick Help / Architecture Badge */}
          <div className="bg-warm-100/70 rounded-2xl border border-warm-200 p-5 space-y-2 text-xs text-warm-600">
            <div className="flex items-center gap-1.5 font-bold text-warm-800">
              <Sparkles className="w-4 h-4 text-mustard-500" />
              <span>TeamFlow Architecture</span>
            </div>
            <p className="text-[11px] leading-relaxed text-warm-500">
              Connected to MongoDB Atlas and ready for Socket.IO event synchronization in subsequent milestones.
            </p>
            <Link
              to="/status"
              className="inline-block text-[11px] font-bold text-terracotta-600 hover:underline pt-1"
            >
              Verify Infrastructure Health &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
