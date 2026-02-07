import apiClient from './client';
import type { Candidate, Pagination } from '../types';

export const candidateAPI = {
  getByJD: async (
    jdId: string,
    params?: {
      page?: number;
      limit?: number;
      stageId?: string;
      isEligible?: boolean;
      college?: string;
      degree?: string;
      passOutYear?: number;
      search?: string;
    }
  ): Promise<{ candidates: Candidate[]; pagination: Pagination }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}`, { params });
    return data;
  },

  getById: async (id: string): Promise<{ candidate: Candidate }> => {
    const { data } = await apiClient.get(`/candidates/${id}`);
    return data;
  },

  create: async (candidateData: Partial<Candidate>): Promise<{ candidate: Candidate }> => {
    const { data } = await apiClient.post('/candidates', candidateData);
    return data;
  },

  update: async (id: string, candidateData: Partial<Candidate>): Promise<{ candidate: Candidate }> => {
    const { data } = await apiClient.put(`/candidates/${id}`, candidateData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/candidates/${id}`);
  },

  moveStage: async (
    id: string,
    stageData: {
      stageId: string;
      notes?: string;
      interviewDate?: string;
      interviewMode?: string;
      interviewerName?: string;
    }
  ): Promise<{ candidate: Candidate }> => {
    const { data } = await apiClient.post(`/candidates/${id}/move-stage`, stageData);
    return data;
  },

  bulkMoveStage: async (bulkData: {
    candidateIds: string[];
    stageId: string;
    notes?: string;
  }): Promise<{ message: string; movedCount: number }> => {
    const { data } = await apiClient.post('/candidates/bulk/move-stage', bulkData);
    return data;
  },

  getEligible: async (
    jdId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ candidates: Candidate[]; pagination: Pagination }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}/eligible`, { params });
    return data;
  },

  getByCollege: async (jdId: string, college: string): Promise<{ candidates: Candidate[] }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}/college/${encodeURIComponent(college)}`);
    return data;
  },
};
