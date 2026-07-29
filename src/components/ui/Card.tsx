import React, { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = false }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${
        hover ? 'hover:-translate-y-1 hover:border-indigo-500/40 cursor-pointer shadow-lg hover:shadow-indigo-500/10' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
