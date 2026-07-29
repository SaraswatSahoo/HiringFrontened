import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import {
  useTemplates,
  useDeleteTemplate,
  useCreateTemplate,
  useUpdateTemplate,
} from '../../hooks/useTemplates';
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
  Code,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: TemplateCategory.INTERVIEW_CALL, label: 'Interview Call' },
  { value: TemplateCategory.SHORTLIST, label: 'Shortlisted' },
  { value: TemplateCategory.REJECTION, label: 'Rejection' },
  { value: TemplateCategory.OFFER, label: 'Offer Letter' },
  { value: TemplateCategory.TEST_LINK, label: 'Test Link' },
  { value: TemplateCategory.REMINDER, label: 'Reminder' },
  { value: TemplateCategory.FEEDBACK_REQUEST, label: 'Feedback Request' },
  { value: TemplateCategory.ONBOARDING, label: 'Onboarding' },
  { value: TemplateCategory.GENERAL, label: 'General' },
];

export const TemplateListPage: React.FC = () => {

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: TemplateCategory.GENERAL,
    subject: '',
    body: '',
    htmlBody: '',
    variablesStr: 'candidate_name, job_title, company_name',
    isActive: true,
  });

  // Hooks
  const { templates, isLoading } = useTemplates({
    ...(categoryFilter && { category: categoryFilter }),
    ...(statusFilter === 'active' && { isActive: true }),
    ...(statusFilter === 'inactive' && { isActive: false }),
  });

  const deleteTemplate = useDeleteTemplate();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

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

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      category: TemplateCategory.GENERAL,
      subject: '',
      body: '',
      htmlBody: '',
      variablesStr: 'candidate_name, job_title, company_name',
      isActive: true,
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: (template.category as TemplateCategory) || 'GENERAL',
      subject: template.subject,
      body: template.body,
      htmlBody: template.htmlBody || '',
      variablesStr: template.variables?.join(', ') || '',
      isActive: template.isActive ?? true,
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      toast.error('Please fill in Name, Subject, and Body');
      return;
    }

    const parsedVariables = formData.variablesStr
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      subject: formData.subject.trim(),
      body: formData.body.trim(),
      htmlBody: formData.htmlBody.trim() || undefined,
      variables: parsedVariables,
      isActive: formData.isActive,
    };

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          data: payload,
        });
      } else {
        await createTemplate.mutateAsync(payload);
      }
      setShowFormModal(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const categoryBadgeVariant = (category: TemplateCategory) => {
    if (category === 'OFFER' || category === 'ONBOARDING') return 'success';
    if (category === 'REJECTION') return 'error';
    if (category === 'INTERVIEW_CALL' || category === 'TEST_LINK') return 'info';
    if (category === 'REMINDER') return 'warning';
    return 'default';
  };

  const categoryLabel = (category: TemplateCategory) => category.replace(/_/g, ' ');

  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    setFormData((prev) => ({
      ...prev,
      body: prev.body + (prev.body.endsWith(' ') || prev.body === '' ? '' : ' ') + placeholder,
    }));
  };

  return (
    <Layout
      title="Email Templates"
      subtitle={`${filteredTemplates.length} ${filteredTemplates.length === 1 ? 'template' : 'templates'} available for candidate communication`}
    >
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-in-up">
        {hasActiveFilters && <Badge variant="warning">Filters active</Badge>}
        <div className="flex-1" />
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, subject, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Filter className="h-4 w-4 text-slate-400" />
              Filter Options
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {(categoryFilter || statusFilter) && <Badge variant="purple">Active Filter</Badge>}

            <div className="flex-1" />

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in-up">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Templates List */}
      <Card className="animate-fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Template</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Variables</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filteredTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className="hover:bg-indigo-500/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {template.name}
                          </p>
                          {template.description && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">
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
                      <p className="text-xs text-slate-300 font-medium truncate max-w-sm">
                        {template.subject}
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs text-slate-300">
                        {template.variables?.length ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            <Code className="h-3 w-3 mr-1 text-indigo-400" />
                            {template.variables.length} var{template.variables.length > 1 ? 's' : ''}
                          </span>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(template)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 text-indigo-400" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(template.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mb-3 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Templates Found</h3>
            <p className="text-xs text-slate-400 mb-5">
              {hasActiveFilters
                ? 'No templates match your filters.'
                : 'Create your first email template to automate candidate outreach.'}
            </p>
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Template
            </Button>
          </div>
        )}
      </Card>

      {/* Create / Edit Template Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Template Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Interview Invitation Email"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of when to use this template..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Subject Line <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Interview Invitation for {{job_title}}"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Variables Quick Insert Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-400" />
              Quick Insert Variable Placeholders:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['candidate_name', 'job_title', 'company_name', 'interview_date', 'interview_mode'].map(
                (v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs hover:bg-indigo-500/20 transition-colors"
                  >
                    + {"{{"}
                    {v}
                    {"}}"}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Body Message <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Dear {{candidate_name}},&#10;&#10;We are pleased to invite you for an interview for {{job_title}}..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Declared Variables (comma-separated)
            </label>
            <input
              type="text"
              value={formData.variablesStr}
              onChange={(e) => setFormData({ ...formData, variablesStr: e.target.value })}
              placeholder="candidate_name, job_title, interview_date"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Set as Active Template
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createTemplate.isPending || updateTemplate.isPending}
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
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

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold mb-1">Subject:</p>
              <p className="text-sm font-bold text-white">{previewTemplate.subject}</p>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold mb-2">Message Body:</p>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans">
                {previewTemplate.body}
              </pre>
            </div>

            {previewTemplate.variables && previewTemplate.variables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Template Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {previewTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 text-xs font-mono border border-slate-700"
                    >
                      {"{{"}
                      {v}
                      {"}}"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-sm text-slate-300 mb-6">
          Are you sure you want to delete this email template? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            loading={deleteTemplate.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default TemplateListPage;
