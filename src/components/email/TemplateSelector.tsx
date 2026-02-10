// src/components/email/TemplateSelector.tsx
import React, { useState } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { TemplateCategory } from '../../types';
import type { EmailTemplate } from '../../types';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string, template: EmailTemplate | null) => void;
  category?: TemplateCategory;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId = '',
  onTemplateSelect,
  category,
  disabled = false,
  showPreview = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | ''>('');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const { templates, isLoading } = useTemplates({
    isActive: true,
    ...(category && { category }),
  });

  // Filter templates
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle template selection
  const handleSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId) || null;
    onTemplateSelect(templateId, template);
  };

  // Handle clear selection
  const handleClear = () => {
    onTemplateSelect('', null);
  };

  // Get selected template
  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  return (
    <div className={className}>
      {/* Selected Template Display */}
      {selectedTemplate && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-purple-900">
                  {selectedTemplate.name}
                </h4>
                <span className="px-2 py-0.5 text-xs bg-purple-200 text-purple-800 rounded">
                  {selectedTemplate.category}
                </span>
              </div>
              {selectedTemplate.description && (
                <p className="text-xs text-purple-700 mt-1">
                  {selectedTemplate.description}
                </p>
              )}
              <p className="text-xs text-purple-600 mt-2 font-medium">
                Subject: {selectedTemplate.subject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(selectedTemplate)}
                  disabled={disabled}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {!selectedTemplate && (
        <div className="space-y-3 mb-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              disabled={disabled}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Category Filter */}
          {!category && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | '')}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          )}
        </div>
      )}

      {/* Template List */}
      {!selectedTemplate && (
        <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => !disabled && handleSelect(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {template.name}
                        </h4>
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                          {template.category}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-xs text-gray-600 mb-1">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Subject: {template.subject}
                      </p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.variables.slice(0, 3).map((varName) => (
                            <span
                              key={varName}
                              className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                            >
                              {'{{' + varName + '}}'}
                            </span>
                          ))}
                          {template.variables.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{template.variables.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {showPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        disabled={disabled}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                {searchQuery || selectedCategory
                  ? 'No templates found matching your criteria'
                  : 'No templates available'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {previewTemplate.name}
                  </h3>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded mt-1 inline-block">
                    {previewTemplate.category}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {previewTemplate.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {previewTemplate.description}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject:
                  </label>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {previewTemplate.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message:
                  </label>
                  <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {previewTemplate.body}
                  </div>
                </div>

                {previewTemplate.htmlBody && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML Body:
                    </label>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <div dangerouslySetInnerHTML={{ __html: previewTemplate.htmlBody }} />
                    </div>
                  </div>
                )}

                {previewTemplate.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variables:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.variables.map((varName) => (
                        <span
                          key={varName}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {'{{' + varName + '}}'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleSelect(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  disabled={disabled}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
