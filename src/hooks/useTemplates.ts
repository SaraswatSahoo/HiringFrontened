// src/hooks/useTemplates.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateAPI } from '../api/email';
import type {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateQueryParams,
  EmailTemplate,
} from '../types';
import { toast } from 'react-hot-toast';

/**
 * Hook for fetching all templates with filters and pagination
 */
export const useTemplates = (params?: TemplateQueryParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateAPI.getAll(params),
  });

  return {
    templates: data?.templates || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single template by ID
 */
export const useTemplate = (id?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateAPI.getById(id!),
    enabled: !!id,
  });

  return {
    template: data as EmailTemplate | undefined,
    isLoading,
    error,
  };
};

/**
 * Hook for creating a new template
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templateAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to create template';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for updating an existing template
 */
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templateAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] });
      toast.success('Template updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to update template';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for deleting a template
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to delete template';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for previewing a template with variables
 */
export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables?: Record<string, any> }) =>
      templateAPI.preview(id, variables),
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to preview template';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for fetching active templates only
 */
export const useActiveTemplates = (category?: string) => {
  const params: TemplateQueryParams = {
    isActive: true,
    ...(category && { category: category as any }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', 'active', category],
    queryFn: () => templateAPI.getAll(params),
  });

  return {
    templates: data?.templates || [],
    isLoading,
    error,
  };
};

/**
 * Combined hook for all template operations
 */
export const useTemplateOperations = () => {
  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const preview = usePreviewTemplate();

  return {
    create,
    update,
    delete: deleteTemplate,
    preview,
  };
};

/**
 * Hook for fetching templates by category
 */
export const useTemplatesByCategory = (category: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', 'category', category],
    queryFn: () => templateAPI.getAll({ category: category as any }),
    enabled: !!category,
  });

  return {
    templates: data?.templates || [],
    isLoading,
    error,
  };
};
