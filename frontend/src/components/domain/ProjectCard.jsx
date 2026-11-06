import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import AvatarGroup from '../common/AvatarGroup.jsx';
import { cn } from '../../utils/cn.js';

export const ProjectCard = ({ project }) => {
  const progressPercent = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-warm-200 p-5 shadow-warm-sm hover:shadow-warm-md hover:border-warm-300 transition-all duration-150 flex flex-col justify-between space-y-4 text-left">
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

          <Badge variant={project.status === 'active' ? 'sage' : 'charcoal'} size="sm">
            {project.status === 'active' ? 'Active' : 'Archived'}
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-heading font-bold text-warm-900 group-hover:text-terracotta-600 transition-colors inline-block"
          >
            {project.name}
          </Link>
          <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      {/* Progress Meter */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-500 font-medium">Progress</span>
          <span className="font-bold text-warm-800">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-warm-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: project.color || '#E98269',
            }}
          />
        </div>
      </div>

      {/* Footer: Due date, task count & team */}
      <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-3 text-xs text-warm-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-medium text-warm-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-500" />
            <span>{project.completedCount}/{project.taskCount} tasks</span>
          </span>
          {project.dueDate && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warm-600">
              <Calendar className="w-3.5 h-3.5 text-warm-400" />
              <span>{project.dueDate.substring(5)}</span>
            </span>
          )}
        </div>

        {project.members && (
          <AvatarGroup users={project.members} max={3} size="xs" />
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
