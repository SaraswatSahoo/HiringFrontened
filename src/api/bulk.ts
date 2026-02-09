// src/api/bulk.ts
import apiClient from './client';
import type { BulkUpload, Pagination } from '../types';

export interface BulkUploadResponse {
  message: string;
  uploadId: string;
  status: string;
  estimatedRows: number;
  warnings?: string[];
}

export interface BulkUploadStatus {
  upload: BulkUpload & {
    progress: number;
    jd: {
      id: string;
      title: string;
      department: string;
    };
    uploadedBy: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface MarkEligibleResponse {
  message: string;
  totalCandidates: number;
  updatedCount: number;
  eligibleCount: number;
  notEligibleCount: number;
  criteria: {
    eligibleDegrees: string[];
    eligibleStreams: string[];
    eligibleYears: number[];
    minCGPA: string | null;
  };
}

export interface CSVValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
  preview: Array<{
    row: number;
    name: string;
    email: string;
    college: string;
    degree: string;
    valid: boolean;
  }>;
  canUpload: boolean;
}

export interface RetryUploadResponse {
  message: string;
  uploadId: string;
  status: string;
  retryAttempt: number;
}

export const bulkAPI = {
  /**
   * Upload CSV file for bulk candidate import
   */
  upload: async (jdId: string, file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jdId', jdId);

    const { data } = await apiClient.post('/bulk/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Get bulk upload status by ID
   */
  getStatus: async (id: string): Promise<BulkUploadStatus> => {
    const { data } = await apiClient.get(`/bulk/status/${id}`);
    return data;
  },

  /**
   * Get all bulk uploads for a specific JD
   */
  getByJD: async (
    jdId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ uploads: BulkUpload[]; pagination: Pagination }> => {
    const { data } = await apiClient.get(`/bulk/jd/${jdId}`, { params });
    return data;
  },

  /**
   * Get all bulk uploads (admin view)
   */
  getAll: async (
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ uploads: BulkUpload[]; pagination: Pagination }> => {
    const { data } = await apiClient.get('/bulk/all', { params });
    return data;
  },

  /**
   * Mark candidates as eligible/not eligible based on JD criteria
   */
  markEligible: async (jdId: string): Promise<MarkEligibleResponse> => {
    const { data } = await apiClient.post(`/bulk/mark-eligible/${jdId}`);
    return data;
  },

  /**
   * Validate CSV before uploading
   */
  validateCSV: async (jdId: string, file: File): Promise<CSVValidationResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jdId', jdId);

    const { data } = await apiClient.post('/bulk/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Retry failed or partial bulk upload
   */
  retry: async (id: string): Promise<RetryUploadResponse> => {
    const { data } = await apiClient.post(`/bulk/retry/${id}`);
    return data;
  },

  /**
   * Delete bulk upload record
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/bulk/${id}`);
    return data;
  },

  /**
   * Download error log as CSV
   */
  downloadErrorLog: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/bulk/${id}/error-log`, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error_log_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download error log:', error);
      throw error;
    }
  },

  /**
   * Download basic sample CSV template
   */
  downloadSample: async (): Promise<void> => {
    try {
      const response = await apiClient.get('/bulk/sample-csv', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidate_upload_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download sample CSV:', error);
      throw error;
    }
  },

  /**
   * Download extended sample CSV template (with all fields)
   */
  downloadExtendedSample: async (): Promise<void> => {
    try {
      const response = await apiClient.get('/bulk/sample-csv-extended', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidate_upload_template_extended.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download extended sample CSV:', error);
      throw error;
    }
  },

  /**
   * Get file as Blob (for preview purposes)
   */
  getSampleAsBlob: async (extended: boolean = false): Promise<Blob> => {
    const endpoint = extended ? '/bulk/sample-csv-extended' : '/bulk/sample-csv';
    const { data } = await apiClient.get(endpoint, {
      responseType: 'blob',
    });
    return data;
  },
};
