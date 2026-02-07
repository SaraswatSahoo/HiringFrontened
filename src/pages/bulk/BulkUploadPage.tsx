import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { bulkAPI } from '../../api/bulk';
import { jdAPI } from '../../api/jd';
import type { JobDescription } from '../../types';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  History,
  X,
  RefreshCw,
} from 'lucide-react';

export const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedJdId = searchParams.get('jdId');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jds, setJDs] = useState<JobDescription[]>([]);
  const [selectedJD, setSelectedJD] = useState(preSelectedJdId || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [pollingUploadId, setPollingUploadId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [downloadingSample, setDownloadingSample] = useState(false);

  useEffect(() => {
    fetchJDs();
  }, []);

  useEffect(() => {
    let interval: number;
    if (pollingUploadId) {
      interval = setInterval(checkUploadStatus, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollingUploadId]);

  const fetchJDs = async () => {
    try {
      const { jds } = await jdAPI.getAll({ status: 'ACTIVE', limit: 100 });
      setJDs(jds);
    } catch (error) {
      console.error('Failed to fetch JDs:', error);
    }
  };

  const checkUploadStatus = async () => {
    if (!pollingUploadId) return;

    try {
      const { upload } = await bulkAPI.getStatus(pollingUploadId);
      setUploadStatus(upload);

      if (['COMPLETED', 'FAILED', 'PARTIAL'].includes(upload.status)) {
        setPollingUploadId(null);
      }
    } catch (error) {
      console.error('Failed to check upload status:', error);
      setPollingUploadId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const isValidType = validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv');
      
      if (!isValidType) {
        alert('Please select a valid CSV file');
        return;
      }

      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedJD) {
      alert('Please select both a JD and a file');
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setUploadStatus(null);

    try {
      const result = await bulkAPI.upload(selectedJD, file);
      setUploadResult(result);
      setPollingUploadId(result.uploadId);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Upload failed. Please try again.';
      alert(errorMsg);
      setUploadResult(null);
      setUploadStatus(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setDownloadingSample(true);
      const blob = await bulkAPI.downloadSample();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sample_bulk_hiring_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download sample:', error);
      alert('Failed to download sample CSV. Please try again.');
    } finally {
      setDownloadingSample(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAnother = () => {
    setFile(null);
    setUploadResult(null);
    setUploadStatus(null);
    setPollingUploadId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    if (!uploadStatus) return null;
    switch (uploadStatus.status) {
      case 'COMPLETED':
        return <CheckCircle className="h-12 w-12 text-green-400" />;
      case 'FAILED':
        return <XCircle className="h-12 w-12 text-red-400" />;
      case 'PARTIAL':
        return <AlertCircle className="h-12 w-12 text-yellow-400" />;
      case 'PROCESSING':
        return <Spinner size="lg" />;
      default:
        return null;
    }
  };

  return (
    <Layout title="Bulk Upload" subtitle="Upload multiple candidates via CSV">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instructions Card */}
        <Card className="animate-slide-in-up">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-blue-500/20 shrink-0">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-3">How to Upload Candidates</h3>
              <ol className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold mr-3 shrink-0">
                    1
                  </span>
                  <span>Download the sample CSV template and fill in candidate details (name, email, phone, college, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold mr-3 shrink-0">
                    2
                  </span>
                  <span>Select the job description for which you're uploading candidates</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold mr-3 shrink-0">
                    3
                  </span>
                  <span>Upload your filled CSV file and wait for processing (usually takes a few seconds)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold mr-3 shrink-0">
                    4
                  </span>
                  <span>Review the upload status and check for any errors or validation issues</span>
                </li>
              </ol>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
            <Button
              onClick={handleDownloadSample}
              variant="secondary"
              loading={downloadingSample}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV Template
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/bulk-upload/history${selectedJD ? `?jdId=${selectedJD}` : ''}`)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </Card>

        {/* Upload Form */}
        <Card className="animate-slide-in-up [animation-delay:100ms]">
          <h3 className="text-lg font-semibold text-white mb-6">Upload Candidates</h3>

          <div className="space-y-6">
            {/* Select JD */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Job Description *
              </label>
              <select
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !!pollingUploadId}
              >
                <option value="">Choose a job description...</option>
                {jds.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title} • {jd.department} • {jd._count?.candidates || 0} candidates
                  </option>
                ))}
              </select>
              {jds.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">
                  No active JDs found. Please create a job description first.
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload CSV File *
              </label>
              <div
                onClick={() => !uploading && !pollingUploadId && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  uploading || pollingUploadId
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${
                  file
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading || !!pollingUploadId}
                />
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-purple-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024).toFixed(2)} KB • Selected
                        </p>
                      </div>
                    </div>
                    {!uploading && !pollingUploadId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <X className="h-5 w-5 text-slate-400 hover:text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-white font-medium mb-1">
                      Click to upload CSV file
                    </p>
                    <p className="text-sm text-slate-400">
                      Supports .csv and .xlsx files up to 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={!file || !selectedJD || !!pollingUploadId}
              className="w-full"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Candidates'}
            </Button>
          </div>
        </Card>

        {/* Upload Status */}
        {(uploadResult || uploadStatus) && (
          <Card className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Upload Status</h3>
              {uploadStatus?.status && ['COMPLETED', 'FAILED', 'PARTIAL'].includes(uploadStatus.status) && (
                <Button variant="ghost" size="sm" onClick={handleUploadAnother}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Upload Another
                </Button>
              )}
            </div>

            {uploadStatus ? (
              <div className="space-y-6">
                {/* Status Header */}
                <div className="text-center py-6">
                  {getStatusIcon()}
                  <h4 className="text-xl font-semibold text-white mt-4 mb-2">
                    {uploadStatus.status === 'COMPLETED' && 'Upload Completed Successfully!'}
                    {uploadStatus.status === 'FAILED' && 'Upload Failed'}
                    {uploadStatus.status === 'PARTIAL' && 'Upload Partially Completed'}
                    {uploadStatus.status === 'PROCESSING' && 'Processing Upload...'}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {uploadStatus.status === 'PROCESSING'
                      ? 'Please wait while we process your candidates'
                      : `Uploaded on ${new Date(uploadStatus.createdAt).toLocaleString()}`}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
                    <p className="text-3xl font-bold text-white mb-1">
                      {uploadStatus.totalRows || 0}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Rows</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                    <p className="text-3xl font-bold text-green-400 mb-1">
                      {uploadStatus.successCount || 0}
                    </p>
                    <p className="text-xs text-green-400 uppercase tracking-wide">Success</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {uploadStatus.failureCount || 0}
                    </p>
                    <p className="text-xs text-red-400 uppercase tracking-wide">Failed</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {uploadStatus.status === 'PROCESSING' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Processing...</span>
                      <span>
                        {uploadStatus.successCount + uploadStatus.failureCount} / {uploadStatus.totalRows}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 animate-pulse"
                        style={{
                          width: `${
                            ((uploadStatus.successCount + uploadStatus.failureCount) /
                              uploadStatus.totalRows) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Log */}
                {uploadStatus.errorLog && uploadStatus.errorLog.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Errors ({uploadStatus.errorLog.length})
                      </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                      {uploadStatus.errorLog.slice(0, 20).map((error: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                        >
                          <p className="text-xs text-red-400 font-medium mb-1">
                            <span className="font-bold">Row {error.rowNumber}:</span> {error.error}
                          </p>
                          {error.data && (
                            <p className="text-xs text-slate-500 font-mono truncate">
                              {JSON.stringify(error.data)}
                            </p>
                          )}
                        </div>
                      ))}
                      {uploadStatus.errorLog.length > 20 && (
                        <p className="text-xs text-slate-500 text-center py-2">
                          And {uploadStatus.errorLog.length - 20} more errors...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {uploadStatus.status !== 'PROCESSING' && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/bulk-upload/history?jdId=${selectedJD}`)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      View Upload History
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/candidates?jdId=${selectedJD}`)}
                    >
                      View Candidates
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-sm text-slate-400">Starting upload...</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};
