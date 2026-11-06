import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import AvatarGroup from '../common/AvatarGroup.jsx';
import { cn } from '../../utils/cn.js';

export const ProjectCard = ({ project }) => {
  const pId = project._id || project.id;
  const progressPercent =
    project.taskCount > 0
      ? Math.round(((project.completedCount || 0) / project.taskCount) * 100)
      : 0;

  const members = (project.memberIds || project.members || []).map((m) => ({
    name: m.name || 'Member',
    avatar: m.avatarUrl || m.avatar,
  }));

  return (
    <div className="group bg-white rounded-2xl border border-warm-200 shadow-warm-sm hover:shadow-warm-md hover:border-warm-300 transition-all duration-150 flex flex-col justify-between overflow-hidden text-left">
      {/* Cover Image Banner (if provided) */}
      {project.coverImage && (
        <div className="h-28 w-full overflow-hidden bg-warm-100">
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* Top: Status & Color Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color || '#E98269' }}
              />
              <span className="text-xs uppercase font-bold tracking-wider text-warm-400">
                Project
              </span>
            </div>

            <Badge
              variant={
                project.status === 'completed'
                  ? 'sage'
                  : project.status === 'active'
                  ? 'terracotta'
                  : 'charcoal'
              }
              size="sm"
            >
              {project.status || 'Active'}
            </Badge>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <Link
              to={`/projects/${pId}`}
              className="text-base font-heading font-bold text-warm-900 group-hover:text-terracotta-600 transition-colors inline-block"
            >
              {project.name}
            </Link>
            <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Progress Meter */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-warm-500 font-medium">Progress</span>
            <span className="font-heading font-bold text-warm-800">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card Footer: Metadata & Assignees */}
        <div className="pt-3 border-t border-warm-100 flex items-center justify-between text-xs text-warm-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
            <span>
              {project.completedCount || 0}/{project.taskCount || 0} tasks
            </span>
          </div>

          {members.length > 0 ? (
            <AvatarGroup users={members} max={3} size="xs" />
          ) : (
            <span className="text-[11px] text-warm-400">No assignees</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
