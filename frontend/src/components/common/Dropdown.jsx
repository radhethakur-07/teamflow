import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn.js';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger(isOpen)}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-40 mt-2 min-w-[180px] rounded-xl bg-white p-1.5 shadow-warm-md border border-warm-200 animate-in fade-in zoom-in-95 duration-150 focus:outline-none",
            alignments[align],
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left focus:outline-none",
        danger
          ? "text-terracotta-600 hover:bg-terracotta-50"
          : "text-warm-700 hover:bg-warm-100 hover:text-warm-900",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Dropdown;
