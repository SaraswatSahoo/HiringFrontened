import apiClient from './client';
import type { BulkUpload, Pagination } from '../types';

export const bulkAPI = {
  upload: async (jdId: string, file: File): Promise<{ uploadId: string; status: string }> => {
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

  getStatus: async (id: string): Promise<{ upload: BulkUpload }> => {
    const { data } = await apiClient.get(`/bulk/status/${id}`);
    return data;
  },

  getByJD: async (
    jdId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ uploads: BulkUpload[]; pagination: Pagination }> => {
    const { data } = await apiClient.get(`/bulk/jd/${jdId}`, { params });
    return data;
  },

  markEligible: async (
    jdId: string
  ): Promise<{
    message: string;
    totalCandidates: number;
    updatedCount: number;
    eligibleCount: number;
    notEligibleCount: number;
  }> => {
    const { data } = await apiClient.post(`/bulk/mark-eligible/${jdId}`);
    return data;
  },

  downloadSample: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/bulk/sample-csv', {
      responseType: 'blob',
    });
    return data;
  },
};
