import React from 'react';
import { Calendar, CheckSquare, MessageSquare, MoreHorizontal } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import AvatarGroup from '../common/AvatarGroup.jsx';
import Dropdown, { DropdownItem } from '../common/Dropdown.jsx';
import { cn } from '../../utils/cn.js';

export const TaskCard = ({
  task,
  onClick,
  onMove,
  columns = [],
}) => {
  const priorityConfigs = {
    urgent: { label: 'Urgent', variant: 'terracotta' },
    high: { label: 'High', variant: 'mustard' },
    medium: { label: 'Medium', variant: 'lavender' },
    low: { label: 'Low', variant: 'charcoal' },
  };

  const priority = priorityConfigs[task.priority] || priorityConfigs.medium;
  const completedChecklist = task.checklist ? task.checklist.filter((c) => c.completed).length : 0;
  const totalChecklist = task.checklist ? task.checklist.length : 0;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-warm-200 p-4 shadow-warm-sm hover:shadow-warm-md hover:border-warm-300 transition-all duration-150 cursor-pointer text-left space-y-3"
    >
      {/* Card Header: Priority & Action Menu */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={priority.variant} size="sm">
          {priority.label}
        </Badge>

        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            align="right"
            trigger={(isOpen) => (
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-warm-400 hover:text-warm-700 rounded-md focus:opacity-100 focus:outline-none"
                aria-label="Task options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          >
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-warm-400 tracking-wider">
              Move to column
            </div>
            {columns.map((col) => (
              <DropdownItem
                key={col.id}
                onClick={() => onMove && onMove(task.id, col.id)}
              >
                {col.title}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-heading font-semibold text-warm-900 group-hover:text-terracotta-600 transition-colors line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-warm-100 text-warm-600 border border-warm-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Due date, checklist, comments & Assignees */}
      <div className="pt-2 border-t border-warm-100 flex items-center justify-between gap-2 text-xs text-warm-500">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warm-600">
              <Calendar className="w-3.5 h-3.5 text-warm-400" />
              <span>{task.dueDate.substring(5)}</span>
            </span>
          )}

          {totalChecklist > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warm-600">
              <CheckSquare className="w-3.5 h-3.5 text-sage-500" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </span>
          )}

          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warm-600">
              <MessageSquare className="w-3.5 h-3.5 text-warm-400" />
              <span>{task.commentsCount}</span>
            </span>
          )}
        </div>

        {task.assignees && task.assignees.length > 0 && (
          <AvatarGroup users={task.assignees} max={2} size="xs" />
        )}
      </div>
    </div>
  );
};

export default TaskCard;
