// src/pages/email/SendEmailPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import EmailComposer from '../../components/email/EmailComposer';
import { useSendIndividualEmail, useSendBulkEmail } from '../../hooks/useEmail';
import type { EmailTemplate, JobDescription, Candidate } from '../../types';
import { jdAPI } from '../../api/jd';
import { candidateAPI } from '../../api/candidate';
import {
  ArrowLeft,
  Users,
  Mail,
  Filter,
} from 'lucide-react';

const SendEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL params
  const candidateIdParam = searchParams.get('candidateId');
  const candidateIdsParam = searchParams.get('candidateIds');
  const jdIdParam = searchParams.get('jdId');

  // Form state
  const [emailType, setEmailType] = useState<'INDIVIDUAL' | 'BULK'>(
    candidateIdParam ? 'INDIVIDUAL' : 'BULK'
  );
  const [selectedJD, setSelectedJD] = useState<string>(jdIdParam || '');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(
    candidateIdsParam
      ? candidateIdsParam.split(',').filter(Boolean)
      : candidateIdParam
        ? [candidateIdParam]
        : []
  );

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [useFilters, setUseFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});

  // Data state
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Hooks
  const sendIndividual = useSendIndividualEmail();
  const sendBulk = useSendBulkEmail();

  const isSending = Boolean(sendIndividual.isPending || sendBulk.isPending);

  const recipientCountLabel = useMemo(() => {
    if (useFilters) return 'Filtered';
    return String(selectedCandidates.length);
  }, [useFilters, selectedCandidates.length]);

  // Fetch JDs on mount
  useEffect(() => {
    const fetchJDs = async () => {
      try {
        setLoadingJDs(true);
        const data = await jdAPI.getAll({ status: 'ACTIVE' });
        setJds((data as any)?.jds || data || []);
      } catch (error) {
        console.error('Failed to fetch JDs:', error);
      } finally {
        setLoadingJDs(false);
      }
    };

    fetchJDs();
  }, []);

  // Auto-select JD if only one exists
  useEffect(() => {
    if (!selectedJD && jds && jds.length === 1) {
      setSelectedJD(jds[0].id);
    }
  }, [jds, selectedJD]);

  // Fetch candidates when JD selected (only used when not using filters)
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedJD) {
        setCandidates([]);
        return;
      }

      try {
        setLoadingCandidates(true);
        const data = await candidateAPI.getByJD(selectedJD, {});
        setCandidates((data as any)?.candidates || data || []);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, [selectedJD]);

  const handleTemplateChange = (templateId: string, _template: EmailTemplate | null) => {
    setSelectedTemplateId(templateId);
  };

  const canSend =
    Boolean(subject && (message || htmlBody) && selectedJD) &&
    (useFilters || selectedCandidates.length > 0);

  const handleSend = async () => {
    if (!selectedJD || !subject || (!message && !htmlBody)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (emailType === 'INDIVIDUAL') {
        if (selectedCandidates.length === 0) {
          alert('Please select at least one candidate');
          return;
        }

        for (const candidateId of selectedCandidates) {
          await sendIndividual.mutateAsync({
            candidateId,
            jdId: selectedJD,
            subject,
            message,
            htmlBody: htmlBody || undefined,
            templateId: selectedTemplateId || undefined,
            variables: Object.keys(variables).length > 0 ? variables : undefined,
          });
        }
      } else {
        await sendBulk.mutateAsync({
          jdId: selectedJD,
          subject,
          message,
          htmlBody: htmlBody || undefined,
          templateId: selectedTemplateId || undefined,
          variables: Object.keys(variables).length > 0 ? variables : undefined,
          filters: useFilters ? filters : undefined,
          candidateIds:
            !useFilters && selectedCandidates.length > 0 ? selectedCandidates : undefined,
        });
      }

      navigate('/emails');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <Layout title="Send Email" subtitle="Send emails to candidates for job applications">
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-in-up">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} disabled={isSending}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1" />

        <Badge variant={emailType === 'INDIVIDUAL' ? 'info' : 'default'}>
          {emailType}
        </Badge>

        <Badge variant="info">
          Recipients: {recipientCountLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Type */}
          <Card className="animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">Email Type</h3>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="emailType"
                  value="INDIVIDUAL"
                  checked={emailType === 'INDIVIDUAL'}
                  onChange={(e) => setEmailType(e.target.value as 'INDIVIDUAL')}
                  className="mr-2 text-purple-500 focus:ring-purple-500"
                  disabled={Boolean(candidateIdParam || candidateIdsParam)}
                />
                <span className="text-sm font-medium text-slate-200">Individual Email</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="emailType"
                  value="BULK"
                  checked={emailType === 'BULK'}
                  onChange={(e) => setEmailType(e.target.value as 'BULK')}
                  className="mr-2 text-purple-500 focus:ring-purple-500"
                  disabled={Boolean(candidateIdParam || candidateIdsParam)}
                />
                <span className="text-sm font-medium text-slate-200">Bulk Email</span>
              </label>
            </div>

            {(candidateIdParam || candidateIdsParam) && (
              <p className="text-xs text-slate-500 mt-3">
                Email type is locked because recipients were preselected from the previous page.
              </p>
            )}
          </Card>

          {/* JD Selection */}
          <Card className="animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">
              Select Job Description <span className="text-red-400">*</span>
            </h3>

            {loadingJDs ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="md" />
              </div>
            ) : (
              <select
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSending || Boolean(jdIdParam)}
              >
                <option value="">-- Select Job Description --</option>
                {jds?.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title} - {jd.department}
                  </option>
                ))}
              </select>
            )}

            {jdIdParam && (
              <p className="text-xs text-slate-500 mt-2">
                JD is preselected from the previous page.
              </p>
            )}
          </Card>

          {/* Email content */}
          <Card className="animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">Email Content</h3>
            <EmailComposer
              initialSubject={subject}
              initialMessage={message}
              initialHtmlBody={htmlBody}
              initialTemplateId={selectedTemplateId}
              onSubjectChange={setSubject}
              onMessageChange={setMessage}
              onHtmlBodyChange={setHtmlBody}
              onTemplateChange={handleTemplateChange}
              onVariablesChange={setVariables}
              onPreview={() => setShowPreview(true)}
              disabled={isSending}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-400" />
              Recipients
            </h3>

            {emailType === 'BULK' && (
              <div className="mb-4 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFilters}
                    onChange={(e) => setUseFilters(e.target.checked)}
                    className="mr-2 text-purple-500 focus:ring-purple-500"
                    disabled={isSending}
                  />
                  <Filter className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Use Filters</span>
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  If enabled, email will be sent to candidates matching filters (server-side).
                </p>
              </div>
            )}

            {!useFilters && selectedJD && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Select Candidates</p>

                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-10">
                    <Spinner size="md" />
                  </div>
                ) : candidates && candidates.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border border-slate-700 rounded-lg bg-slate-800/30">
                    <label className="flex items-center cursor-pointer p-3 sticky top-0 bg-slate-900/80 backdrop-blur border-b border-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.length === candidates.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCandidates(candidates.map((c) => c.id));
                          } else {
                            setSelectedCandidates([]);
                          }
                        }}
                        className="mr-2 text-purple-500 focus:ring-purple-500"
                        disabled={isSending}
                      />
                      <span className="text-sm font-semibold text-white">
                        Select All ({candidates.length})
                      </span>
                    </label>

                    <div className="p-2 space-y-1">
                      {candidates.map((candidate) => (
                        <label
                          key={candidate.id}
                          className="flex items-start cursor-pointer p-2 rounded hover:bg-slate-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCandidates([...selectedCandidates, candidate.id]);
                              } else {
                                setSelectedCandidates(
                                  selectedCandidates.filter((id) => id !== candidate.id)
                                );
                              }
                            }}
                            className="mr-2 mt-1 text-purple-500 focus:ring-purple-500"
                            disabled={isSending}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {candidate.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {candidate.email}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {candidate.college} - {candidate.degree}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 border border-slate-700 rounded-lg bg-slate-800/20">
                    <p className="text-sm text-slate-400">No candidates found for this JD</p>
                  </div>
                )}
              </div>
            )}

            {useFilters && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Email will be sent to all candidates matching the selected filters.
                </p>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Eligibility</p>
                  <select
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isSending}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        isEligible:
                          e.target.value === 'eligible'
                            ? true
                            : e.target.value === 'not-eligible'
                              ? false
                              : undefined,
                      })
                    }
                  >
                    <option value="">All Candidates</option>
                    <option value="eligible">Eligible Only</option>
                    <option value="not-eligible">Not Eligible</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">College</p>
                  <input
                    type="text"
                    placeholder="Enter college name"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isSending}
                    onChange={(e) =>
                      setFilters({ ...filters, college: e.target.value || undefined })
                    }
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Degree</p>
                  <input
                    type="text"
                    placeholder="e.g., B.Tech, M.Tech"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isSending}
                    onChange={(e) =>
                      setFilters({ ...filters, degree: e.target.value || undefined })
                    }
                  />
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Total Recipients</span>
                <span className="text-lg font-bold text-purple-300">{recipientCountLabel}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="animate-fade-in">
            <div className="space-y-3">
              <Button
                onClick={handleSend}
                className="w-full"
                disabled={isSending || !canSend}
                loading={isSending}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
                {!useFilters && selectedCandidates.length > 0 ? ` (${selectedCandidates.length})` : ''}
              </Button>

              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="w-full"
                disabled={isSending}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Email Preview"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">Subject</p>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white">
              {subject || '(No subject)'}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Body</p>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 whitespace-pre-wrap">
              {htmlBody ? (
                <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
              ) : (
                message || '(No message)'
              )}
            </div>
          </div>

          {Object.keys(variables).length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Variables</p>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200">
                {Object.entries(variables).map(([k, v]) => (
                  <p key={k} className="break-all">
                    <span className="text-slate-400">{k}:</span> {String(v)}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-slate-700">
            <Button variant="ghost" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default SendEmailPage;
