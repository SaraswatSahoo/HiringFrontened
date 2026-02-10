// src/components/email/EmailComposer.tsx
import React, { useState, useEffect } from 'react';
import { useTemplates } from '../../hooks/useTemplates';
import { TemplateCategory } from '../../types';
import type { EmailTemplate } from '../../types';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { 
  DocumentTextIcon, 
  EyeIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

interface EmailComposerProps {
  initialSubject?: string;
  initialMessage?: string;
  initialHtmlBody?: string;
  initialTemplateId?: string;
  onSubjectChange?: (subject: string) => void;
  onMessageChange?: (message: string) => void;
  onHtmlBodyChange?: (htmlBody: string) => void;
  onTemplateChange?: (templateId: string, template: EmailTemplate | null) => void;
  onVariablesChange?: (variables: Record<string, any>) => void;
  showTemplateSelector?: boolean;
  showHtmlToggle?: boolean;
  showPreviewButton?: boolean;
  onPreview?: () => void;
  disabled?: boolean;
  templateCategory?: TemplateCategory;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  initialSubject = '',
  initialMessage = '',
  initialHtmlBody = '',
  initialTemplateId = '',
  onSubjectChange,
  onMessageChange,
  onHtmlBodyChange,
  onTemplateChange,
  onVariablesChange,
  showTemplateSelector = true,
  showHtmlToggle = true,
  showPreviewButton = true,
  onPreview,
  disabled = false,
  templateCategory,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [htmlBody, setHtmlBody] = useState(initialHtmlBody);
  const [useHtml, setUseHtml] = useState(!!initialHtmlBody);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const { templates, isLoading: loadingTemplates } = useTemplates({
    isActive: true,
    ...(templateCategory && { category: templateCategory }),
  });

  useEffect(() => {
    if (onSubjectChange) {
      onSubjectChange(subject);
    }
  }, [subject, onSubjectChange]);

  useEffect(() => {
    if (onMessageChange) {
      onMessageChange(message);
    }
  }, [message, onMessageChange]);

  useEffect(() => {
    if (onHtmlBodyChange) {
      onHtmlBodyChange(htmlBody);
    }
  }, [htmlBody, onHtmlBodyChange]);

  useEffect(() => {
    if (onVariablesChange) {
      onVariablesChange(variables);
    }
  }, [variables, onVariablesChange]);

  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        setSubject(template.subject);
        setMessage(template.body);
        setHtmlBody(template.htmlBody || '');
        setUseHtml(!!template.htmlBody);

        const defaultVars: Record<string, any> = {};
        template.variables.forEach((varName) => {
          defaultVars[varName] = template.defaultValues?.[varName] || '';
        });
        setVariables(defaultVars);

        if (onTemplateChange) {
          onTemplateChange(selectedTemplateId, template);
        }
      }
    } else {
      setSelectedTemplate(null);
      if (onTemplateChange) {
        onTemplateChange('', null);
      }
    }
  }, [selectedTemplateId, templates, onTemplateChange]);

  const handleVariableChange = (varName: string, value: string) => {
    const newVariables = { ...variables, [varName]: value };
    setVariables(newVariables);
  };

  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    setMessage((prev) => prev + ' ' + placeholder);
  };

  return (
    <div className="space-y-4">
      {showTemplateSelector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Email Template (Optional)
            </div>
          </label>
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- No Template (Write Custom) --</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          )}
          {selectedTemplate && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedTemplate.description || 'Template selected'}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Enter email subject"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Message <span className="text-red-500">*</span>
          </label>
          {showPreviewButton && onPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onPreview}
              disabled={disabled || !subject || !message}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Preview
            </Button>
          )}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Enter email message. Use {{variableName}} for dynamic content."
          required
        />
        <div className="flex items-start justify-between mt-2">
          <p className="text-xs text-gray-500">
            Available variables: <code className="bg-gray-100 px-1 rounded">{'{{candidateName}}'}</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{{jdTitle}}'}</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">{'{{college}}'}</code>, etc.
          </p>
          <p className="text-xs text-gray-400">
            {message.length} characters
          </p>
        </div>
      </div>

      {showHtmlToggle && (
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useHtml}
              onChange={(e) => {
                setUseHtml(e.target.checked);
                if (!e.target.checked) {
                  setHtmlBody('');
                } else {
                  setHtmlBody(message);
                }
              }}
              disabled={disabled}
              className="mr-2 disabled:cursor-not-allowed"
            />
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Use HTML Content
          </label>
          {useHtml && (
            <div className="mt-2">
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                disabled={disabled}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter HTML content (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML body will be used if provided, otherwise plain text message will be sent.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Template Variables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedTemplate.variables.map((varName) => (
              <div key={varName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {varName}
                  {selectedTemplate.defaultValues?.[varName] && (
                    <span className="text-xs text-gray-500 ml-1">
                      (default: {String(selectedTemplate.defaultValues[varName])})
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variables[varName] || ''}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    disabled={disabled}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={`Enter ${varName}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertVariable(varName)}
                    disabled={disabled}
                    title={`Insert {{${varName}}}`}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedTemplate && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Quick Insert Variables
          </h3>
          <div className="flex flex-wrap gap-2">
            {['candidateName', 'jdTitle', 'college', 'degree', 'interviewDate', 'interviewTime'].map(
              (varName) => (
                <button
                  key={varName}
                  type="button"
                  onClick={() => insertVariable(varName)}
                  disabled={disabled}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {'{{' + varName + '}}'}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;
