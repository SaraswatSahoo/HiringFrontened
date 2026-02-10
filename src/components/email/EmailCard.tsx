// src/components/email/EmailCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EmailWithRelations } from '../../types';
import { EmailType } from '../../types';
import EmailStatusBadge from './EmailStatusBadge';
import {
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface EmailCardProps {
  email: EmailWithRelations;
  showJD?: boolean;
  onClick?: (email: EmailWithRelations) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ 
  email, 
  showJD = true,
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(email);
    } else {
      navigate(`/emails/${email.id}`);
    }
  };

  // Calculate success rate
  const successRate = email.totalRecipients > 0
    ? Math.round((email.deliveredCount / email.totalRecipients) * 100)
    : 0;

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not sent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {email.subject}
            </h3>
            <span
              className={`
                px-2 py-0.5 text-xs font-medium rounded
                ${email.type === EmailType.BULK 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}
            >
              {email.type}
            </span>
          </div>
          
          {/* JD Info */}
          {showJD && email.jd && (
            <p className="text-sm text-gray-600">
              {email.jd.title} {email.jd.department && `• ${email.jd.department}`}
            </p>
          )}

          {/* Template Info */}
          {email.template && (
            <p className="text-xs text-gray-500 mt-1">
              Template: {email.template.name}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <EmailStatusBadge 
            status={email.recipients?.[0]?.status || 'PENDING' as any} 
            size="sm" 
          />
        </div>
      </div>

      {/* Message Preview */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {email.message}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Total Recipients */}
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Recipients</p>
            <p className="text-sm font-semibold text-gray-900">
              {email.totalRecipients}
            </p>
          </div>
        </div>

        {/* Sent Count */}
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-500">Sent</p>
            <p className="text-sm font-semibold text-blue-600">
              {email.sentCount}
            </p>
          </div>
        </div>

        {/* Delivered Count */}
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-sm font-semibold text-green-600">
              {email.deliveredCount}
            </p>
          </div>
        </div>

        {/* Failed Count */}
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-sm font-semibold text-red-600">
              {email.failedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Delivery Rate</span>
          <span className="font-medium">{successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              successRate >= 80 ? 'bg-green-500' :
              successRate >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          <span>{formatDate(email.sentAt || email.createdAt)}</span>
        </div>

        {email.sender && (
          <span className="text-gray-600">
            by {email.sender.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default EmailCard;
