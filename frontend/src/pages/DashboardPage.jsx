import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  BarChart3,
  RefreshCw,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import analyticsService from '../services/analyticsService.js';
import StatWidget from '../components/domain/StatWidget.jsx';
import ProjectCard from '../components/domain/ProjectCard.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';

export const DashboardPage = () => {
  const { onOpenNewTask } = useOutletContext() || {};
  const { currentUser, projects, tasks, members, workspace } = useApp();

  const [timeframe, setTimeframe] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    const wsId = workspace?._id || workspace?.id;
    if (!wsId) {
      setIsLoadingAnalytics(false);
      return;
    }

    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const data = await analyticsService.getWorkspaceAnalytics(wsId, timeframe);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load workspace analytics:', err);
      setAnalyticsError(err.message || 'Failed to retrieve analytics metrics.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [workspace, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const displayName = currentUser?.name || 'Workspace Member';
  const firstName = displayName.split(' ')[0];

  // Database metrics fallback to active memory state if still loading
  const taskBreakdown = analytics?.taskBreakdown || {
    total: tasks.length,
    todo: tasks.filter((t) => t.column === 'todo').length,
    inprogress: tasks.filter((t) => t.column === 'inprogress' || t.column === 'in_progress').length,
    review: tasks.filter((t) => t.column === 'review' || t.column === 'in_review').length,
    done: tasks.filter((t) => t.column === 'done' || t.column === 'completed').length,
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter((t) => t.column === 'done' || t.column === 'completed').length / tasks.length) * 100)
      : 0,
  };

  const projectMetrics = analytics?.projectMetrics || [];
  const teamWorkload = analytics?.teamWorkload || [];
  const overdueSummary = analytics?.overdueSummary || { count: 0, tasks: [] };
  const rawVelocity = analytics?.activityVelocity;
  const activityVelocity = typeof rawVelocity === 'object' && rawVelocity !== null
    ? (rawVelocity.totalEvents ?? 0)
    : (rawVelocity ?? 0);

  const urgentTasks = tasks
    .filter((t) => t.priority === 'urgent' || t.priority === 'high')
    .slice(0, 4);

  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-warm-200">
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
            Real-time throughput and database-verified progress metrics for your workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-white border border-warm-200 rounded-xl p-1 shadow-warm-xs">
            {['7d', '30d', '90d', 'all'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-heading font-bold rounded-lg transition-colors ${
                  timeframe === tf
                    ? 'bg-terracotta-500 text-white shadow-warm-xs'
                    : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100'
                }`}
              >
                {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={fetchAnalytics}
            isLoading={isLoadingAnalytics}
            title="Refresh database aggregations"
          >
            Sync
          </Button>

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

      {/* Primary KPI Stats Grid backed by MongoDB Aggregations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          title="Active Projects"
          value={projects.filter((p) => p.status === 'active').length}
          change={`${projects.length} Total Projects`}
          trend="up"
          color="terracotta"
          icon={FolderKanban}
        />
        <StatWidget
          title="Completion Rate"
          value={`${taskBreakdown.completionRate}%`}
          change={`${taskBreakdown.done} of ${taskBreakdown.total} tasks completed`}
          trend={taskBreakdown.completionRate >= 50 ? 'up' : 'neutral'}
          color="sage"
          icon={CheckCircle2}
        />
        <StatWidget
          title="Overdue Tasks"
          value={overdueSummary.count}
          change={overdueSummary.count === 0 ? 'All tasks on schedule' : 'Requires immediate action'}
          trend={overdueSummary.count === 0 ? 'up' : 'down'}
          color={overdueSummary.count > 0 ? 'terracotta' : 'mustard'}
          icon={AlertCircle}
        />
        <StatWidget
          title="Activity Velocity"
          value={activityVelocity}
          change="Audited team events"
          trend="up"
          color="lavender"
          icon={Flame}
        />
      </div>

      {/* Real Task Distribution Bar */}
      <div className="bg-white rounded-2xl border border-warm-200 p-5 space-y-4 shadow-warm-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-terracotta-600" />
            <h2 className="text-sm font-heading font-bold text-warm-900 uppercase tracking-wider">
              Workflow Status Distribution ({taskBreakdown.total} Total Tasks)
            </h2>
          </div>
          <span className="text-xs text-warm-500 font-medium">
            Timeframe: {timeframe.toUpperCase()}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-warm-100 rounded-full overflow-hidden flex">
          {taskBreakdown.total > 0 ? (
            <>
              <div
                style={{ width: `${(taskBreakdown.done / taskBreakdown.total) * 100}%` }}
                className="bg-sage-500 transition-all duration-500"
                title={`Done: ${taskBreakdown.done}`}
              />
              <div
                style={{ width: `${(taskBreakdown.review / taskBreakdown.total) * 100}%` }}
                className="bg-lavender-500 transition-all duration-500"
                title={`In Review: ${taskBreakdown.review}`}
              />
              <div
                style={{ width: `${(taskBreakdown.inprogress / taskBreakdown.total) * 100}%` }}
                className="bg-mustard-400 transition-all duration-500"
                title={`In Progress: ${taskBreakdown.inprogress}`}
              />
              <div
                style={{ width: `${(taskBreakdown.todo / taskBreakdown.total) * 100}%` }}
                className="bg-terracotta-400 transition-all duration-500"
                title={`To Do: ${taskBreakdown.todo}`}
              />
            </>
          ) : (
            <div className="w-full bg-warm-200 text-center text-[10px] text-warm-500">
              No tasks recorded
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-terracotta-400 flex-shrink-0" />
            <span className="text-warm-600">To Do:</span>
            <span className="font-bold text-warm-900">{taskBreakdown.todo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-mustard-400 flex-shrink-0" />
            <span className="text-warm-600">In Progress:</span>
            <span className="font-bold text-warm-900">{taskBreakdown.inprogress}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-lavender-500 flex-shrink-0" />
            <span className="text-warm-600">In Review:</span>
            <span className="font-bold text-warm-900">{taskBreakdown.review}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sage-500 flex-shrink-0" />
            <span className="text-warm-600">Completed:</span>
            <span className="font-bold text-warm-900">{taskBreakdown.done}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Project Velocity & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Health & Completion Aggregations */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 space-y-4 shadow-warm-sm">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-heading font-bold text-warm-900 tracking-tight">
                Project Progress Aggregation
              </h2>
              <p className="text-xs text-warm-500">
                Calculated completion percentages and overdue items per initiative.
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {projectMetrics.map((pm, idx) => (
              <div
                key={pm.projectId || pm._id || pm.id || idx}
                className="space-y-1.5 p-3 rounded-xl bg-warm-50/60 border border-warm-100"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: pm.color || '#E98269' }}
                    />
                    <span className="font-bold text-warm-900">{pm.name}</span>
                    {pm.overdueTasks > 0 && (
                      <Badge variant="terracotta" size="sm">
                        {pm.overdueTasks} overdue
                      </Badge>
                    )}
                  </div>
                  <span className="font-heading font-bold text-warm-900">
                    {pm.completionPercentage}% ({pm.completedTasks}/{pm.totalTasks})
                  </span>
                </div>

                <div className="w-full h-2 bg-warm-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-500 rounded-full transition-all duration-500"
                    style={{ width: `${pm.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}

            {projectMetrics.length === 0 && (
              <p className="text-xs text-warm-400 italic py-4 text-center">
                No active projects found.
              </p>
            )}
          </div>
        </div>

        {/* Real Team Workload Distribution */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5 space-y-4 shadow-warm-sm">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-heading font-bold text-warm-900 tracking-tight">
                Team Workload & Capacity
              </h2>
              <p className="text-xs text-warm-500">
                Active tasks versus completed deliverables across team members.
              </p>
            </div>
            <Link
              to="/members"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
            >
              <span>Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {teamWorkload.map((tw, idx) => (
              <div
                key={tw.userId || tw._id || tw.email || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-warm-50/60 border border-warm-100"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={tw.name} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-warm-900 leading-tight">
                      {tw.name}
                    </h4>
                    <p className="text-[11px] text-warm-500">{tw.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="charcoal" size="sm" title="Active pending tasks">
                    {tw.activeCount ?? tw.active ?? 0} Active
                  </Badge>
                  <Badge variant="sage" size="sm" title="Completed tasks">
                    {tw.completedCount ?? tw.completed ?? 0} Done
                  </Badge>
                </div>
              </div>
            ))}

            {teamWorkload.length === 0 && (
              <p className="text-xs text-warm-400 italic py-4 text-center">
                No team assignments recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* High Priority Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-heading font-bold text-warm-900 tracking-tight">
              High Priority & Urgent Tasks
            </h2>
            <p className="text-xs text-warm-500">
              Action items requiring immediate focus across projects.
            </p>
          </div>

          <Link
            to="/board"
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 hover:underline"
          >
            <span>Open Kanban Board</span>
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
