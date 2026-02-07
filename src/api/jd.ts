import apiClient from './client';
import type { JobDescription, Stage, Pagination } from '../types';

export const jdAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    search?: string;
  }): Promise<{ jds: JobDescription[]; pagination: Pagination }> => {
    const { data } = await apiClient.get('/jds', { params });
    return data;
  },

  getById: async (id: string): Promise<{ jd: JobDescription; stages: Stage[] }> => {
    const { data } = await apiClient.get(`/jds/${id}`);
    return data;
  },

  create: async (jdData: Partial<JobDescription>): Promise<{ jd: JobDescription }> => {
    const { data } = await apiClient.post('/jds', jdData);
    return data;
  },

  update: async (id: string, jdData: Partial<JobDescription>): Promise<{ jd: JobDescription }> => {
    const { data } = await apiClient.put(`/jds/${id}`, jdData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jds/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<{ jd: JobDescription }> => {
    const { data } = await apiClient.patch(`/jds/${id}/status`, { status });
    return data;
  },

  getStages: async (id: string): Promise<{ stages: Stage[] }> => {
    const { data } = await apiClient.get(`/jds/${id}/stages`);
    return data;
  },

  updateEligibility: async (
    id: string,
    criteria: {
      eligibleDegrees?: string[];
      eligibleYears?: number[];
      minCGPA?: number;
    }
  ): Promise<{ jd: JobDescription }> => {
    const { data } = await apiClient.put(`/jds/${id}/eligibility`, criteria);
    return data;
  },
};
