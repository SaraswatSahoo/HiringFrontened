import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Table } from '../../components/ui/Table';
import { bulkAPI } from '../../api/bulk';
import { jdAPI } from '../../api/jd';
import type { BulkUpload, JobDescription } from '../../types';
import { Upload, Eye, RefreshCw } from 'lucide-react';

export const UploadHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedJdId = searchParams.get('jdId');

  const [jds, setJDs] = useState<JobDescription[]>([]);
  const [selectedJD, setSelectedJD] = useState(preSelectedJdId || '');
  const [uploads, setUploads] = useState<BulkUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJDs();
  }, []);

  useEffect(() => {
    if (selectedJD) {
      fetchUploads();
    }
  }, [selectedJD, page]);

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
      });
      setUploads(uploadsData);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PARTIAL':
        return 'warning';
      default:
        return 'info';
    }
  };

  const columns = [
    {
      key: 'fileName',
      label: 'File Name',
      render: (upload: BulkUpload) => (
        <div>
          <p className="text-sm font-medium text-white">{upload.fileName}</p>
          <p className="text-xs text-slate-400">
            {new Date(upload.createdAt).toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (upload: BulkUpload) => (
        <Badge variant={getStatusVariant(upload.status)}>{upload.status}</Badge>
      ),
    },
    {
      key: 'totalRows',
      label: 'Total',
      render: (upload: BulkUpload) => (
        <span className="text-sm text-slate-300">{upload.totalRows || 0}</span>
      ),
    },
    {
      key: 'successCount',
      label: 'Success',
      render: (upload: BulkUpload) => (
        <span className="text-sm text-green-400 font-semibold">
          {upload.successCount || 0}
        </span>
      ),
    },
    {
      key: 'failureCount',
      label: 'Failed',
      render: (upload: BulkUpload) => (
        <span className="text-sm text-red-400 font-semibold">
          {upload.failureCount || 0}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (upload: BulkUpload) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/bulk-upload/status/${upload.id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <Layout title="Upload History" subtitle="View past bulk upload records">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <select
              value={selectedJD}
              onChange={(e) => setSelectedJD(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a JD</option>
              {jds.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={fetchUploads} disabled={!selectedJD}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate('/bulk-upload')}>
            <Upload className="h-4 w-4 mr-2" />
            New Upload
          </Button>
        </div>

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
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-slate-300 text-sm">
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
              )}

              {uploads.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>No upload history found for this JD</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a JD to view upload history</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
