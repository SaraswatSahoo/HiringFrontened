// src/api/email.ts
import apiClient from './client';
import type {
  CreateEmailDto,
  SendEmailResponse,
  EmailListResponse,
  EmailWithRelations,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateListResponse,
  EmailTemplate,
  EmailQueryParams,
  TemplateQueryParams,
  SendIndividualEmailDto,
  TemplatePreviewResponse,
  EmailStats,
  CandidateEmailListResponse,
} from '../types';

// ==================== EMAIL APIs ====================

export const emailAPI = {
  /**
   * Send individual email to a candidate
   * POST /api/v1/communications/email/individual
   */
  sendIndividual: async (data: SendIndividualEmailDto): Promise<SendEmailResponse> => {
    const { data: result } = await apiClient.post('/communications/email/individual', data);
    return result.data;
  },

  /**
   * Send bulk email to multiple candidates
   * POST /api/v1/communications/email/bulk
   */
  sendBulk: async (data: CreateEmailDto): Promise<SendEmailResponse> => {
    const { data: result } = await apiClient.post('/communications/email/bulk', data);
    return result.data;
  },

  /**
   * Get all emails with pagination and filters
   * GET /api/v1/communications/emails
   */
  getAll: async (params?: EmailQueryParams): Promise<EmailListResponse> => {
    const { data } = await apiClient.get('/communications/emails', { params });
    return data;
  },

  /**
   * Get single email by ID
   * GET /api/v1/communications/email/:id
   */
  getById: async (id: string): Promise<EmailWithRelations> => {
    const { data } = await apiClient.get(`/communications/email/${id}`);
    return data.data || data.email;
  },

  /**
   * Get emails by JD
   * GET /api/v1/communications/jd/:jdId/emails
   */
  getByJD: async (
    jdId: string,
    params?: { page?: number; limit?: number }
  ): Promise<EmailListResponse> => {
    const { data } = await apiClient.get(`/communications/jd/${jdId}/emails`, { params });
    return data;
  },

  /**
   * Get candidate emails (emails sent to a specific candidate)
   * GET /api/v1/communications/candidate/:candidateId/emails
   */
  getCandidateEmails: async (
    candidateId: string,
    params?: { page?: number; limit?: number }
  ): Promise<CandidateEmailListResponse> => {
    const { data } = await apiClient.get(`/communications/candidate/${candidateId}/emails`, {
      params,
    });
    return data;
  },

  /**
   * Retry failed email
   * POST /api/v1/communications/email/:candidateEmailId/retry
   */
  retryFailed: async (candidateEmailId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/communications/email/${candidateEmailId}/retry`);
    return data;
  },

  /**
   * Get email statistics (overall or filtered)
   * GET /api/v1/communications/stats
   */
  getStats: async (params?: {
    jdId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EmailStats> => {
    const { data } = await apiClient.get('/communications/stats', { params });
    return data.data || data.stats;
  },

  /**
   * Get email statistics for a specific JD
   * GET /api/v1/communications/jd/:jdId/stats
   */
  getStatsByJD: async (jdId: string): Promise<EmailStats> => {
    const { data } = await apiClient.get(`/communications/jd/${jdId}/stats`);
    return data.data || data.stats;
  },
};

// ==================== TEMPLATE APIs ====================

export const templateAPI = {
  /**
   * Get all email templates
   * GET /api/v1/communications/templates
   */
  getAll: async (params?: TemplateQueryParams): Promise<TemplateListResponse> => {
    const { data } = await apiClient.get('/communications/templates', { params });
    return data;
  },

  /**
   * Get single template by ID
   * GET /api/v1/communications/template/:id
   */
  getById: async (id: string): Promise<EmailTemplate> => {
    const { data } = await apiClient.get(`/communications/template/${id}`);
    return data.data || data.template;
  },

  /**
   * Create new email template
   * POST /api/v1/communications/template
   */
  create: async (data: CreateTemplateDto): Promise<EmailTemplate> => {
    const { data: result } = await apiClient.post('/communications/template', data);
    return result.data || result.template;
  },

  /**
   * Update email template
   * PUT /api/v1/communications/template/:id
   */
  update: async (id: string, updateData: UpdateTemplateDto): Promise<EmailTemplate> => {
    const { data } = await apiClient.put(`/communications/template/${id}`, updateData);
    return data.data || data.template;
  },

  /**
   * Delete email template
   * DELETE /api/v1/communications/template/:id
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/communications/template/${id}`);
    return data;
  },

  /**
   * Preview template with variables
   * POST /api/v1/communications/template/:id/preview
   */
  preview: async (
    id: string,
    variables?: Record<string, any>
  ): Promise<TemplatePreviewResponse> => {
    const { data } = await apiClient.post(`/communications/template/${id}/preview`, { variables });
    return data.preview || data.data;
  },
};

// Export combined object (default export)
export default {
  email: emailAPI,
  template: templateAPI,
};
