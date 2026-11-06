import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Users, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { projects, tasks, members } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-warm-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-xl bg-white rounded-2xl shadow-warm-lg border border-warm-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-warm-200">
          <Search className="w-5 h-5 text-warm-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, team members... (e.g. Redesign, Mobile, Jane)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-warm-100 text-warm-500 hover:text-warm-800"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-left">
          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-warm-400 tracking-wider px-2">
                Projects
              </span>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(`/projects/${p.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-warm-100/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs font-semibold text-warm-900 group-hover:text-terracotta-600">
                      {p.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-warm-400 tracking-wider px-2">
                Tasks
              </span>
              {filteredTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(`/board`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-warm-100/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-3.5 h-3.5 text-sage-500" />
                    <span className="text-xs font-medium text-warm-900 truncate max-w-sm group-hover:text-terracotta-600">
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-warm-100 text-warm-600 capitalize">
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Team Members */}
          {filteredMembers.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-warm-400 tracking-wider px-2">
                Team Members
              </span>
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelect(`/members`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-warm-100/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-warm-900">{m.name}</p>
                      <p className="text-[11px] text-warm-400">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-warm-500">{m.roleTitle}</span>
                </div>
              ))}
            </div>
          )}

          {/* Zero results */}
          {filteredProjects.length === 0 && filteredTasks.length === 0 && filteredMembers.length === 0 && (
            <div className="text-center py-8 text-warm-400 text-xs">
              No matching projects, tasks, or team members found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-warm-50 border-t border-warm-200 flex items-center justify-between text-[11px] text-warm-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-warm-200 rounded font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-warm-200 rounded font-mono">↓</kbd> to navigate</span>
          <span>TeamFlow Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
