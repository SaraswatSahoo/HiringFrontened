// src/api/feedback.ts
import apiClient from './client';
import type { Feedback, CreateFeedbackData } from '../types';

export interface FeedbackAverage {
  rating: number | null;
  technicalSkills: number | null;
  communication: number | null;
  cultureFit: number | null;
  problemSolving: number | null;
}

export interface CandidateFeedbacksResponse {
  feedbacks: Feedback[];
  averages: FeedbackAverage;
  count: number;
}

export interface JDFeedbacksResponse {
  feedbacks: Feedback[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const feedbackAPI = {
  /**
   * Submit new feedback for a candidate
   */
  create: async (feedbackData: CreateFeedbackData): Promise<{ message: string; feedback: Feedback }> => {
    const { data } = await apiClient.post('/feedback', feedbackData);
    return data;
  },

  /**
   * Get all feedbacks for a candidate
   */
  getByCandidate: async (candidateId: string): Promise<CandidateFeedbacksResponse> => {
    const { data } = await apiClient.get(`/feedback/candidate/${candidateId}`);
    return data;
  },

  /**
   * Get feedback by ID
   */
  getById: async (id: string): Promise<{ feedback: Feedback }> => {
    const { data } = await apiClient.get(`/feedback/${id}`);
    return data;
  },

  /**
   * Get all feedbacks for a specific JD
   */
  getByJD: async (
    jdId: string,
    params?: { page?: number; limit?: number }
  ): Promise<JDFeedbacksResponse> => {
    const { data } = await apiClient.get(`/feedback/jd/${jdId}`, { params });
    return data;
  },

  /**
   * Update feedback
   */
  update: async (
    id: string,
    feedbackData: Partial<CreateFeedbackData>
  ): Promise<{ message: string; feedback: Feedback }> => {
    const { data } = await apiClient.put(`/feedback/${id}`, feedbackData);
    return data;
  },

  /**
   * Delete feedback
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/feedback/${id}`);
    return data;
  },
};

export default feedbackAPI;
