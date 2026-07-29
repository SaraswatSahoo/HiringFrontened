// src/api/candidate.ts
import apiClient from './client';
import type { Candidate, Pagination } from '../types';

export interface CandidateFilters {
  // Pagination
  page?: number;
  limit?: number;
  
  // Stage & Status Filters
  stageId?: string;
  isEligible?: boolean;
  applicationStatus?: 'PENDING' | 'REVIEWING' | 'PROCESSED' | 'REJECTED';
  offerStatus?: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  
  // Academic Filters
  college?: string;
  degree?: string;
  branch?: string;
  stream?: string;
  passOutYear?: number;
  minCGPA?: number;
  maxCGPA?: number;
  
  // Location Filters
  city?: string;
  state?: string;
  
  // Experience & Demographics
  hasWorkExperience?: boolean;
  hasJoined?: boolean;
  gender?: 'Male' | 'Female' | 'Other';
  
  // Skills & Search
  skills?: string; // Comma-separated
  search?: string;
  
  // Sorting
  sortBy?: 'name' | 'email' | 'college' | 'cgpa' | 'passOutYear' | 'appliedAt' | 'lastActivityAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface MoveStageData {
  stageId: string;
  notes?: string;
  interviewDate?: string;
  interviewMode?: 'Online' | 'Offline' | 'Telephonic' | 'Video';
  interviewerName?: string;
}

export interface BulkMoveStageData {
  candidateIds: string[];
  stageId: string;
  notes?: string;
}

export interface BulkUpdateOffersData {
  candidateIds: string[];
  offerStatus: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
}

export interface UpdateOfferStatusData {
  offerStatus: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  offerLetterUrl?: string;
  offeredCTC?: number;
  joiningDate?: string;
}

export interface UpdateScoresData {
  interviewScore?: number;
  technicalScore?: number;
  hrScore?: number;
  overallRating?: number;
}

export interface SkillsFilterParams {
  skills: string; // Comma-separated
  matchAll?: boolean;
}

export const candidateAPI = {
  /**
   * Get all candidates for a JD with comprehensive filters
   */
  getByJD: async (
    jdId: string,
    filters?: CandidateFilters
  ): Promise<{ candidates: Candidate[]; pagination: Pagination }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}`, { 
      params: filters 
    });
    return data;
  },

  /**
   * Get candidate by ID with full details
   */
  getById: async (id: string): Promise<{ candidate: Candidate }> => {
    const { data } = await apiClient.get(`/candidates/${id}`);
    return data;
  },

  /**
   * Create a new candidate
   */
  create: async (candidateData: Partial<Candidate>): Promise<{ 
    message: string; 
    candidate: Candidate 
  }> => {
    const { data } = await apiClient.post('/candidates', candidateData);
    return data;
  },

  /**
   * Update candidate details
   */
  update: async (
    id: string, 
    candidateData: Partial<Candidate>
  ): Promise<{ 
    message: string; 
    candidate: Candidate 
  }> => {
    const { data } = await apiClient.put(`/candidates/${id}`, candidateData);
    return data;
  },

  /**
   * Update offer status for a candidate
   */
  updateOfferStatus: async (
    id: string,
    offerData: UpdateOfferStatusData
  ): Promise<{ 
    message: string; 
    candidate: Candidate 
  }> => {
    const { data } = await apiClient.patch(`/candidates/${id}/offer-status`, offerData);
    return data;
  },

  /**
   * Update assessment scores
   */
  updateScores: async (
    id: string,
    scoresData: UpdateScoresData
  ): Promise<{ 
    message: string; 
    candidate: Candidate 
  }> => {
    const { data } = await apiClient.patch(`/candidates/${id}/scores`, scoresData);
    return data;
  },

  /**
   * Delete a candidate
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/candidates/${id}`);
    return data;
  },

  /**
   * Move candidate to a different stage
   */
  moveStage: async (
    id: string,
    stageData: MoveStageData
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/candidates/${id}/move-stage`, stageData);
    return data;
  },

  /**
   * Bulk move candidates to a stage
   */
  bulkMoveStage: async (
    bulkData: BulkMoveStageData
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/candidates/bulk/move-stage', bulkData);
    return data;
  },

  /**
   * Bulk update offer status for multiple candidates
   */
  bulkUpdateOffers: async (
    bulkData: BulkUpdateOffersData
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/candidates/bulk/update-offers', bulkData);
    return data;
  },

  /**
   * Get candidates by college
   */
  getByCollege: async (
    jdId: string, 
    college: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ 
    candidates: Candidate[]; 
    count: number;
    pagination: Pagination 
  }> => {
    const { data } = await apiClient.get(
      `/candidates/jd/${jdId}/college/${encodeURIComponent(college)}`,
      { params }
    );
    return data;
  },

  /**
   * Get eligible candidates for a JD
   */
  getEligible: async (
    jdId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ 
    candidates: Candidate[]; 
    pagination: Pagination 
  }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}/eligible`, { params });
    return data;
  },

  /**
   * Get candidates with offers
   */
  getWithOffers: async (
    jdId: string,
    params?: { 
      status?: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
      page?: number;
      limit?: number;
    }
  ): Promise<{ 
    candidates: Candidate[]; 
    pagination: Pagination 
  }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}/offers`, { params });
    return data;
  },

  /**
   * Get candidates by skills
   */
  getBySkills: async (
    jdId: string,
    skillsParams: SkillsFilterParams
  ): Promise<{ 
    candidates: Candidate[];
    count: number;
    matchType: 'ALL' | 'ANY';
    searchedSkills: string[];
  }> => {
    const { data } = await apiClient.get(`/candidates/jd/${jdId}/skills`, {
      params: skillsParams
    });
    return data;
  },

  /**
   * Export candidates as CSV
   */
  exportCSV: async (jdId: string, filters?: CandidateFilters): Promise<void> => {
    const response = await apiClient.get(`/candidates/jd/${jdId}/export`, {
      params: filters,
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = `candidates_${jdId}.csv`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
