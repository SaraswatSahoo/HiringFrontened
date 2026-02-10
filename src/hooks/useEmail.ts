// src/hooks/useEmail.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailAPI } from '../api/email';
import type {
  CreateEmailDto,
  SendIndividualEmailDto,
  EmailQueryParams,
  EmailWithRelations,
} from '../types';
import { toast } from 'react-hot-toast';

/**
 * Hook for fetching all emails with filters and pagination
 */
export const useEmails = (params?: EmailQueryParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['emails', params],
    queryFn: () => emailAPI.getAll(params),
  });

  return {
    emails: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single email by ID
 */
export const useEmail = (id?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['email', id],
    queryFn: () => emailAPI.getById(id!),
    enabled: !!id,
  });

  return {
    email: data as EmailWithRelations | undefined,
    isLoading,
    error,
  };
};

/**
 * Hook for fetching emails by JD
 */
export const useJDEmails = (jdId: string, params?: { page?: number; limit?: number }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jd-emails', jdId, params],
    queryFn: () => emailAPI.getByJD(jdId, params),
    enabled: !!jdId,
  });

  return {
    emails: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching candidate emails
 */
export const useCandidateEmails = (
  candidateId: string,
  params?: { page?: number; limit?: number }
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['candidate-emails', candidateId, params],
    queryFn: () => emailAPI.getCandidateEmails(candidateId, params),
    enabled: !!candidateId,
  });

  return {
    emails: data?.emails || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for email statistics
 */
export const useEmailStats = (params?: {
  jdId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['email-stats', params],
    queryFn: () => emailAPI.getStats(params),
  });

  return {
    stats: data,
    isLoading,
    error,
  };
};

/**
 * Hook for JD-specific email statistics
 */
export const useJDEmailStats = (jdId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jd-email-stats', jdId],
    queryFn: () => emailAPI.getStatsByJD(jdId),
    enabled: !!jdId,
  });

  return {
    stats: data,
    isLoading,
    error,
  };
};

/**
 * Hook for sending individual email
 */
export const useSendIndividualEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendIndividualEmailDto) => emailAPI.sendIndividual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-stats'] });
      toast.success('Email sent successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to send email';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for sending bulk email
 */
export const useSendBulkEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailDto) => emailAPI.sendBulk(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['jd-emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-stats'] });
      toast.success(
        `Bulk email initiated! Sending to ${response.totalRecipients} recipient(s).`
      );
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to send bulk email';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for retrying failed email
 */
export const useRetryFailedEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateEmailId: string) => emailAPI.retryFailed(candidateEmailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-emails'] });
      toast.success('Email retry initiated!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to retry email';
      toast.error(errorMessage);
    },
  });
};

/**
 * Combined hook for all email operations
 */
export const useEmailOperations = () => {
  const sendIndividual = useSendIndividualEmail();
  const sendBulk = useSendBulkEmail();
  const retryFailed = useRetryFailedEmail();

  return {
    sendIndividual,
    sendBulk,
    retryFailed,
  };
};
