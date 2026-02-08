import apiClient from './client';
import type { 
  JobDescription, 
  JDStats, 
  Stage, 
  Pagination,
  JDStatus 
} from '../types';

// Request/Response specific types (not in global types)
export interface CreateJDData {
  title: string;
  description: string;
  department: string;
  location?: string;
  status?: JDStatus;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  
  // Eligibility
  eligibleDegrees?: string[];
  eligibleStreams?: string[];
  eligibleYears?: number[];
  minCGPA?: number;
  
  // Additional
  responsibilities?: string;
  skills?: string[];
  employmentType?: string;
  experienceLevel?: string;
  workMode?: string;
}

export interface UpdateJDData extends Partial<CreateJDData> {
  status?: JDStatus;
}

export interface JDFilters {
  page?: number;
  limit?: number;
  status?: JDStatus;
  department?: string;
  search?: string;
}

// API Client
export const jdAPI = {
  /**
   * Get all job descriptions with optional filters
   */
  getAll: async (params?: JDFilters): Promise<{ jds: JobDescription[]; pagination: Pagination }> => {
    const { data } = await apiClient.get('/jds', { params });
    return data;
  },

  /**
   * Get a single job description by ID
   */
  getById: async (id: string): Promise<{ jd: JobDescription; stats?: JDStats }> => {
    const { data } = await apiClient.get(`/jds/${id}`);
    return data;
  },

  /**
   * Create a new job description
   */
  create: async (jdData: CreateJDData): Promise<{ message: string; jd: JobDescription }> => {
    const { data } = await apiClient.post('/jds', jdData);
    return data;
  },

  /**
   * Update an existing job description
   */
  update: async (id: string, jdData: UpdateJDData): Promise<{ message: string; jd: JobDescription }> => {
    const { data } = await apiClient.put(`/jds/${id}`, jdData);
    return data;
  },

  /**
   * Delete a job description
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/jds/${id}`);
    return data;
  },

  /**
   * Update job description status
   */
  updateStatus: async (
    id: string, 
    status: JDStatus
  ): Promise<{ message: string; jd: JobDescription }> => {
    const { data } = await apiClient.patch(`/jds/${id}/status`, { status });
    return data;
  },

  /**
   * Get stages for a job description
   */
  getStages: async (id: string): Promise<{ stages: Stage[] }> => {
    const { data } = await apiClient.get(`/jds/${id}/stages`);
    return data;
  },

  /**
   * Get statistics for a job description
   */
  getStats: async (id: string): Promise<{ stats: JDStats }> => {
    const { data } = await apiClient.get(`/jds/${id}/stats`);
    return data;
  },

  /**
   * Duplicate a job description
   */
  duplicate: async (id: string): Promise<{ message: string; jd: JobDescription }> => {
    const { data } = await apiClient.post(`/jds/${id}/duplicate`);
    return data;
  },

  /**
   * Update eligibility criteria (deprecated - use update instead)
   * @deprecated Use update() method with eligibility fields
   */
  updateEligibility: async (
    id: string,
    criteria: {
      eligibleDegrees?: string[];
      eligibleStreams?: string[];
      eligibleYears?: number[];
      minCGPA?: number;
    }
  ): Promise<{ message: string; jd: JobDescription }> => {
    const { data } = await apiClient.put(`/jds/${id}`, criteria);
    return data;
  },
};

export default jdAPI;
