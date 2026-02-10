// src/pages/email/TemplateListPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { useTemplates, useDeleteTemplate } from '../../hooks/useTemplates';
import { TemplateCategory } from '../../types';
import type { EmailTemplate } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  FileText,
  ChevronDown,
  X,
} from 'lucide-react';

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Hooks
  const { templates, isLoading } = useTemplates({
    ...(categoryFilter && { category: categoryFilter }),
    ...(statusFilter === 'active' && { isActive: true }),
    ...(statusFilter === 'inactive' && { isActive: false }),
  });

  const deleteTemplate = useDeleteTemplate();

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    if (!searchQuery) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
      );
    });
  }, [templates, searchQuery]);

  const hasActiveFilters = Boolean(searchQuery || categoryFilter || statusFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const categoryBadgeVariant = (category: TemplateCategory) => {
    // Map categories to your Badge variants (best-effort)
    if (category === 'OFFER' || category === 'ONBOARDING') return 'success';
    if (category === 'REJECTION') return 'error';
    if (category === 'INTERVIEW_CALL' || category === 'TEST_LINK') return 'info';
    if (category === 'REMINDER') return 'warning';
    return 'default';
  };

  const categoryLabel = (category: TemplateCategory) => category.replace(/_/g, ' ');

  return (
    <Layout
      title="Templates"
      subtitle={`${filteredTemplates.length} ${filteredTemplates.length === 1 ? 'template' : 'templates'}`}
    >
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-in-up">
        {hasActiveFilters && <Badge variant="warning">Filters active</Badge>}
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => navigate('/templates/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search + Filters */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, subject, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Filters header row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
            >
              <Filter className="h-5 w-5 text-slate-400" />
              Filters
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {(categoryFilter || statusFilter) && <Badge variant="warning">Active</Badge>}

            <div className="flex-1" />

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filters body */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in-up">
              {/* Category */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Category</p>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | '')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  <option value="INTERVIEW_CALL">Interview Call</option>
                  <option value="OFFER">Offer Letter</option>
                  <option value="REJECTION">Rejection</option>
                  <option value="SHORTLIST">Shortlist</option>
                  <option value="TEST_LINK">Test Link</option>
                  <option value="REMINDER">Reminder</option>
                  <option value="FEEDBACK_REQUEST">Feedback Request</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* List */}
      <Card className="animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="info">{filteredTemplates.length} templates</Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Variables
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700">
                  {filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {template.name}
                            </p>
                            {template.description && (
                              <p className="text-xs text-slate-400 truncate max-w-md">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={categoryBadgeVariant(template.category as TemplateCategory)}>
                          {categoryLabel(template.category as TemplateCategory)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-200 truncate max-w-md">
                          {template.subject}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-300">
                          {template.variables?.length ? (
                            <>
                              {template.variables.length} variable
                              {template.variables.length > 1 ? 's' : ''}
                            </>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={template.isActive ? 'success' : 'default'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/templates/${template.id}/edit`)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(template.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <FileText className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Templates Found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {hasActiveFilters
                ? 'No templates match your filters or search.'
                : 'Create your first reusable email template.'}
            </p>
            <Button variant="secondary" onClick={() => navigate('/templates/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </Card>

      {/* Preview Modal (uses your Modal component) */}
      <Modal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate ? `Preview: ${previewTemplate.name}` : 'Preview'}
        size="lg"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={categoryBadgeVariant(previewTemplate.category as TemplateCategory)}>
                {categoryLabel(previewTemplate.category as TemplateCategory)}
              </Badge>
              <Badge variant={previewTemplate.isActive ? 'success' : 'default'}>
                {previewTemplate.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {previewTemplate.description && (
              <p className="text-sm text-slate-400">{previewTemplate.description}</p>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-2">Subject</p>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white">
                {previewTemplate.subject}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Body</p>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 whitespace-pre-wrap">
                {previewTemplate.body}
              </div>
            </div>

            {previewTemplate.variables?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Variables</p>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    >
                      {'{{' + v + '}}'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
              <Button variant="ghost" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button
                onClick={() => navigate(`/templates/${previewTemplate.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal (uses your Modal component) */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => !deleteTemplate.isPending && setDeleteConfirm(null)}
        title="Delete Template"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Are you sure you want to delete this template? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteConfirm!)}
              loading={deleteTemplate.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default TemplateListPage;
