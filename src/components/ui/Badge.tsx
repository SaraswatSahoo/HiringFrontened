import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs shadow-amber-500/10',
    error: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-xs shadow-rose-500/10',
    info: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-xs shadow-sky-500/10',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-xs shadow-purple-500/10',
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    info: 'bg-sky-400',
    purple: 'bg-purple-400',
    default: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${variants[variant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      {children}
    </span>
  );
};
