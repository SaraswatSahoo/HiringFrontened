// src/pages/email/EmailHistoryPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import EmailCard from '../../components/email/EmailCard';
import { useEmails, useEmailStats } from '../../hooks/useEmail';
import { EmailStatus } from '../../types';
import {
  Mail,
  Plus,
  Filter,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  X,
} from 'lucide-react';

const EmailHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [status, setStatus] = useState<EmailStatus | ''>('');
  const [jdId, setJdId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const emailQueryParams = useMemo(
    () => ({
      page,
      limit,
      ...(status && { status }),
      ...(jdId && { jdId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }),
    [page, limit, status, jdId, startDate, endDate]
  );

  const statsQueryParams = useMemo(
    () => ({
      ...(jdId && { jdId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }),
    [jdId, startDate, endDate]
  );

  // Fetch emails
  const emailsRes = useEmails(emailQueryParams);
  const { emails, pagination, isLoading } = emailsRes as any;

  // Fetch stats
  const statsRes = useEmailStats(statsQueryParams);
  const { stats } = statsRes as any;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // If your hooks expose refetch(), this will work; if not, it’s safely ignored.
      await Promise.all([
        (emailsRes as any)?.refetch?.(),
        (statsRes as any)?.refetch?.(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const clearFilters = () => {
    setStatus('');
    setJdId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(status || jdId || startDate || endDate);

  // Safe stat values
  const totalSent = (stats as any)?.totalSent ?? (stats as any)?.total ?? 0;
  const totalDelivered = (stats as any)?.totalDelivered ?? (stats as any)?.delivered ?? 0;
  const totalFailed = (stats as any)?.totalFailed ?? (stats as any)?.failed ?? 0;
  const successRate =
    totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

  const statCards = [
    {
      label: 'Total Sent',
      value: totalSent,
      icon: Mail,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Delivered',
      value: totalDelivered,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      hint: totalSent ? `${successRate}%` : undefined,
      hintColor: 'text-green-400',
    },
    {
      label: 'Failed',
      value: totalFailed,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
    },
    {
      label: 'Success Rate',
      value: successRate,
      suffix: '%',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <Layout
      title="Emails"
      subtitle={
        pagination?.total
          ? `${pagination.total} ${pagination.total === 1 ? 'email' : 'emails'}`
          : 'Email history & delivery status'
      }
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-in-up">
        {hasActiveFilters && <Badge variant="warning">Filters active</Badge>}
        {status && <Badge variant="info">{status}</Badge>}
        <div className="flex-1" />

        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button variant="secondary" onClick={() => navigate('/emails/send')}>
          <Plus className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <Card key={idx} hover className="animate-slide-in-up">
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}
              />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-lg bg-linear-to-br ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                  {stat.suffix || ''}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  {stat.hint && (
                    <span className={`text-xs font-semibold ${stat.hintColor || 'text-slate-400'}`}>
                      {stat.hint}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filters Card */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
          >
            <Filter className="h-5 w-5 text-slate-400" />
            Filters
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>

          {hasActiveFilters && <Badge variant="warning">Active</Badge>}

          <div className="flex-1" />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="pt-4 mt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-in-up">
            {/* Status */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as EmailStatus | '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="SENT">SENT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="FAILED">FAILED</option>
                <option value="BOUNCED">BOUNCED</option>
              </select>
            </div>

            {/* JD */}
            <div>
              <p className="text-xs text-slate-400 mb-1">JD ID</p>
              <input
                type="text"
                value={jdId}
                onChange={(e) => {
                  setJdId(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by JD ID..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Start */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Start date</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* End */}
            <div>
              <p className="text-xs text-slate-400 mb-1">End date</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Email List */}
      <Card className="animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : emails && emails.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="info">{emails.length} on this page</Badge>
                {pagination?.total ? <Badge variant="default">{pagination.total} total</Badge> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emails.map((email: any) => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && <span className="text-slate-500">...</span>}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <Mail className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Emails Found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {hasActiveFilters ? 'No emails match your filters.' : "You haven't sent any emails yet."}
            </p>
            <Button variant="secondary" onClick={() => navigate('/emails/send')}>
              <Plus className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default EmailHistoryPage;
