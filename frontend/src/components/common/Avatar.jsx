import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("relative inline-block flex-shrink-0 select-none", className)}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={cn(
            "rounded-full object-cover border border-warm-200 bg-warm-100",
            sizes[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-warm-200 text-warm-800 font-semibold flex items-center justify-center border border-warm-300",
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white",
            status === 'online' && "bg-sage-500",
            status === 'busy' && "bg-terracotta-500",
            status === 'offline' && "bg-warm-400"
          )}
        />
      )}
    </div>
  );
};

export const AvatarGroup = ({
  users = [],
  max = 3,
  size = 'sm',
  className = '',
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn("flex items-center -space-x-2 overflow-hidden", className)}>
      {visibleUsers.map((user, idx) => (
        <div key={user.id || idx} className="ring-2 ring-white rounded-full">
          <Avatar
            src={user.avatar}
            name={user.name}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "rounded-full bg-warm-200 text-warm-700 font-bold flex items-center justify-center ring-2 ring-white text-[10px]",
            size === 'sm' ? "w-7 h-7" : "w-8 h-8"
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
