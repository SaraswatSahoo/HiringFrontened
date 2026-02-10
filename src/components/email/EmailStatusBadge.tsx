// src/components/email/EmailStatusBadge.tsx
import React from 'react';
import { EmailStatus } from '../../types';

interface EmailStatusBadgeProps {
  status: EmailStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmailStatusBadge: React.FC<EmailStatusBadgeProps> = ({ 
  status, 
  className = '',
  size = 'md'
}) => {
  // Status configurations
  const statusConfig = {
    [EmailStatus.PENDING]: {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      dotColor: 'bg-yellow-500',
    },
    [EmailStatus.SENT]: {
      label: 'Sent',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      dotColor: 'bg-blue-500',
    },
    [EmailStatus.DELIVERED]: {
      label: 'Delivered',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500',
    },
    [EmailStatus.FAILED]: {
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
    [EmailStatus.BOUNCED]: {
      label: 'Bounced',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      dotColor: 'bg-orange-500',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-sm',
      dot: 'w-2 h-2',
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-base',
      dot: 'w-2.5 h-2.5',
    },
  };

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  if (!config) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizeStyles.padding}
        ${sizeStyles.text}
        ${config.bgColor}
        ${config.textColor}
        font-medium rounded-full
        ${className}
      `}
    >
      <span className={`${sizeStyles.dot} ${config.dotColor} rounded-full`} />
      {config.label}
    </span>
  );
};

export default EmailStatusBadge;
