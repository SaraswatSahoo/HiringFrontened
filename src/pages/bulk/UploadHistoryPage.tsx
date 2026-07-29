import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Table } from '../../components/ui/Table';
import { bulkAPI } from '../../api/bulk';
import { jdAPI } from '../../api/jd';
import type { BulkUpload, JobDescription, UploadStatus } from '../../types';
import {
  Upload,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const UploadHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preSelectedJdId = searchParams.get('jdId');
  const preSelectedStatus = searchParams.get('status') as UploadStatus | null;

  const [jds, setJDs] = useState<JobDescription[]>([]);
  const [selectedJD, setSelectedJD] = useState(preSelectedJdId || '');
  const [selectedStatus, setSelectedStatus] = useState<UploadStatus | ''>(preSelectedStatus || '');
  const [uploads, setUploads] = useState<BulkUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUploads, setTotalUploads] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJDs();
  }, []);

  useEffect(() => {
    if (selectedJD) {
      fetchUploads();
    }
  }, [selectedJD, selectedStatus, page]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedJD) params.set('jdId', selectedJD);
    if (selectedStatus) params.set('status', selectedStatus);
    setSearchParams(params);
  }, [selectedJD, selectedStatus, setSearchParams]);

  const fetchJDs = async () => {
    try {
      const { jds } = await jdAPI.getAll({ limit: 100 });
      setJDs(jds);
    } catch (error) {
      console.error('Failed to fetch JDs:', error);
    }
  };

  const fetchUploads = async () => {
    if (!selectedJD) return;

    try {
      setLoading(true);
      const { uploads: uploadsData, pagination } = await bulkAPI.getByJD(selectedJD, {
        page,
        limit: 10,
        status: selectedStatus || undefined,
      });
      setUploads(uploadsData);
      setTotalPages(pagination.totalPages);
      setTotalUploads(pagination.total);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!window.confirm('Are you sure you want to delete this upload record?')) {
      return;
    }

    try {
      setDeletingId(uploadId);
      await bulkAPI.delete(uploadId);
      toast.success('Upload record deleted successfully');
      fetchUploads(); // Refresh list
    } catch (error) {
      console.error('Failed to delete upload:', error);
      toast.error('Failed to delete upload. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetry = async (uploadId: string) => {
    try {
      setRetryingId(uploadId);
      await bulkAPI.retry(uploadId);
      toast.success('Upload retry initiated. The status will update shortly.');
      // Wait a bit then refresh
      setTimeout(fetchUploads, 2000);
    } catch (error) {
      console.error('Failed to retry upload:', error);
      toast.error('Failed to retry upload. Please try again.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDownloadErrorLog = async (uploadId: string) => {
    try {
      await bulkAPI.downloadErrorLog(uploadId);
      toast.success('Error log downloaded');
    } catch (error) {
      console.error('Failed to download error log:', error);
      toast.error('Failed to download error log. Please try again.');
    }
  };

  const getStatusVariant = (status: UploadStatus): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PARTIAL':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'PARTIAL':
        return <AlertCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  const calculateProgress = (upload: BulkUpload): number => {
    if (upload.totalRows === 0) return 0;
    return Math.round(
      ((upload.successCount + upload.failureCount) / upload.totalRows) * 100
    );
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateDuration = (upload: BulkUpload): string => {
    if (!upload.completedAt) return 'In progress';
    const start = new Date(upload.createdAt).getTime();
    const end = new Date(upload.completedAt).getTime();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const columns = [
    {
      key: 'fileName',
      label: 'File Info',
      render: (upload: BulkUpload) => (
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-purple-400 shrink-0" />
            <p className="text-sm font-medium text-white truncate max-w-xs">
              {upload.fileName}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
            <span>{new Date(upload.createdAt).toLocaleString()}</span>
            {upload.fileSize && <span>• {formatFileSize(upload.fileSize)}</span>}
            {upload.fileType && <span>• {upload.fileType}</span>}
          </div>
          {upload.uploader && (
            <p className="text-xs text-slate-500 mt-0.5">
              By {upload.uploader.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (upload: BulkUpload) => (
        <div className="space-y-1">
          <Badge variant={getStatusVariant(upload.status)} className="inline-flex items-center gap-1">
            {getStatusIcon(upload.status)}
            {upload.status}
          </Badge>
          {upload.status === 'PROCESSING' && (
            <div className="w-24">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div
                  className="bg-purple-500 h-1 rounded-full transition-all"
                  style={{ width: `${calculateProgress(upload)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {calculateProgress(upload)}%
              </p>
            </div>
          )}
          {upload.retryCount > 0 && (
            <p className="text-xs text-yellow-400">
              Retried {upload.retryCount}x
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stats',
      label: 'Statistics',
      render: (upload: BulkUpload) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-semibold">{upload.totalRows || 0}</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Success:</span>
            <span className="text-green-400 font-semibold">
              {upload.successCount || 0}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Failed:</span>
            <span className="text-red-400 font-semibold">
              {upload.failureCount || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (upload: BulkUpload) => (
        <div className="text-sm text-slate-300">
          {calculateDuration(upload)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (upload: BulkUpload) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/bulk-upload/status/${upload.id}`)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {upload.errorLog && (upload.errorLog as any[]).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadErrorLog(upload.id)}
              title="Download error log"
            >
              <Download className="h-4 w-4 text-yellow-400" />
            </Button>
          )}
          
          {(upload.status === 'FAILED' || upload.status === 'PARTIAL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRetry(upload.id)}
              disabled={retryingId === upload.id}
              title="Retry upload"
            >
              {retryingId === upload.id ? (
                <Spinner size="sm" />
              ) : (
                <RefreshCw className="h-4 w-4 text-blue-400" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(upload.id)}
            disabled={deletingId === upload.id}
            title="Delete upload"
          >
            {deletingId === upload.id ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-400" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  // Calculate stats
  const stats = {
    total: totalUploads,
    completed: uploads.filter((u) => u.status === 'COMPLETED').length,
    failed: uploads.filter((u) => u.status === 'FAILED').length,
    partial: uploads.filter((u) => u.status === 'PARTIAL').length,
    processing: uploads.filter((u) => u.status === 'PROCESSING').length,
  };

  return (
    <Layout title="Upload History" subtitle="View and manage bulk upload records">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-1 max-w-2xl">
              {/* JD Filter */}
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Job Description</label>
                <select
                  value={selectedJD}
                  onChange={(e) => {
                    setSelectedJD(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a JD</option>
                  {jds.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title} • {jd.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-48">
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as UploadStatus | '');
                    setPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!selectedJD}
                >
                  <option value="">All Status</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <Button
                variant="ghost"
                onClick={fetchUploads}
                disabled={!selectedJD || loading}
                className="mt-5"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <Button onClick={() => navigate('/bulk-upload')} className="mt-5">
              <Upload className="h-4 w-4 mr-2" />
              New Upload
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        {selectedJD && uploads.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-green-400 uppercase tracking-wide mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Partial</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.partial}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-400">{stats.processing}</p>
            </Card>
          </div>
        )}

        {/* Upload History Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : selectedJD ? (
            <>
              <Table data={uploads} columns={columns} loading={loading} />

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Showing {uploads.length} of {totalUploads} uploads
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-slate-300 text-sm px-3">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {uploads.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Filter className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No uploads found</p>
                  <p className="text-sm">
                    {selectedStatus 
                      ? `No ${selectedStatus.toLowerCase()} uploads for this JD`
                      : 'No upload history found for this JD'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Select a Job Description</p>
              <p className="text-sm">Choose a JD from the dropdown to view upload history</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
