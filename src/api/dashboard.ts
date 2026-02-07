import apiClient from './client';
import type {
  DashboardSummary,
  StageStats,
  CollegePerformance,
} from '../types';

export const dashboardAPI = {
  getAdminDashboard: async (): Promise<any> => {
    const { data } = await apiClient.get('/dashboard/admin');
    return data;
  },

  getJDDashboard: async (jdId: string): Promise<any> => {
    const { data } = await apiClient.get(`/dashboard/jd/${jdId}`);
    return data;
  },

  getSummary: async (jdId: string): Promise<{ summary: DashboardSummary }> => {
    const { data } = await apiClient.get(`/dashboard/summary/${jdId}`);
    return data;
  },

  getStageStats: async (jdId: string): Promise<{ totalCandidates: number; stages: StageStats[] }> => {
    const { data } = await apiClient.get(`/dashboard/stages/${jdId}`);
    return data;
  },

  getCollegePerformance: async (jdId: string): Promise<{ performance: CollegePerformance[] }> => {
    const { data } = await apiClient.get(`/dashboard/college-performance/${jdId}`);
    return data;
  },

  getTopColleges: async (jdId: string, limit?: number): Promise<{ colleges: CollegePerformance[] }> => {
    const { data } = await apiClient.get(`/dashboard/top-colleges/${jdId}`, {
      params: { limit },
    });
    return data;
  },

  getCGPADistribution: async (
    jdId: string
  ): Promise<{
    distribution: Record<string, number>;
    totalCandidates: number;
    avgCGPA: string | null;
  }> => {
    const { data } = await apiClient.get(`/dashboard/cgpa-distribution/${jdId}`);
    return data;
  },

  getDegreeDistribution: async (
    jdId: string
  ): Promise<{
    totalCandidates: number;
    degrees: Array<{ degree: string; count: number; percentage: string }>;
  }> => {
    const { data } = await apiClient.get(`/dashboard/degree-distribution/${jdId}`);
    return data;
  },

  getEligibilityStats: async (jdId: string): Promise<any> => {
    const { data } = await apiClient.get(`/dashboard/eligibility-stats/${jdId}`);
    return data;
  },

  getAnalytics: async (
    jdId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<any> => {
    const { data } = await apiClient.get(`/dashboard/analytics/${jdId}`, { params });
    return data;
  },
};
