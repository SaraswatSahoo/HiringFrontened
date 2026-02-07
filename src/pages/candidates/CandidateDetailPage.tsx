import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { candidateAPI } from '../../api/candidate';
import { jdAPI } from '../../api/jd';
import type { Candidate, Stage } from '../../types';
import {
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  Award,
  ExternalLink,
  ArrowRight,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [moveNotes, setMoveNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchCandidateDetails();
    }
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const { candidate: candidateData } = await candidateAPI.getById(id!);
      setCandidate(candidateData);

      if (candidateData.jdId) {
        const { stages: stagesData } = await jdAPI.getStages(candidateData.jdId);
        setStages(stagesData);
      }
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async () => {
    if (!selectedStage) return;

    try {
      await candidateAPI.moveStage(id!, {
        stageId: selectedStage,
        notes: moveNotes || undefined,
      });
      setShowMoveModal(false);
      setSelectedStage('');
      setMoveNotes('');
      fetchCandidateDetails();
    } catch (error) {
      console.error('Failed to move candidate:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      await candidateAPI.delete(id!);
      navigate(`/candidates?jdId=${candidate?.jdId}`);
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!candidate) {
    return (
      <Layout title="Not Found">
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-white mb-2">Candidate Not Found</h3>
          <Button onClick={() => navigate('/candidates')}>Back to Candidates</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={candidate.name} subtitle={candidate.email}>
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Badge variant={candidate.isEligible ? 'success' : 'error'}>
            {candidate.isEligible ? 'Eligible' : 'Not Eligible'}
          </Badge>
          {candidate.currentStage && (
            <Badge variant="info">{candidate.currentStage.name}</Badge>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => setShowMoveModal(true)}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Move Stage
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/candidates/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Personal Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-sm text-white hover:text-purple-400"
                    >
                      {candidate.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-teal-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Phone</p>
                    <a
                      href={`tel:${candidate.phone}`}
                      className="text-sm text-white hover:text-teal-400"
                    >
                      {candidate.phone}
                    </a>
                    {candidate.alternatePhone && (
                      <p className="text-xs text-slate-500 mt-1">
                        Alt: {candidate.alternatePhone}
                      </p>
                    )}
                  </div>
                </div>

                {candidate.resumeLink && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Resume</p>
                      <a
                        href={candidate.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Resume
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Academic Details */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Academic Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-orange-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">College</p>
                    <p className="text-sm font-semibold text-white">{candidate.college}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-green-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Degree & Branch</p>
                    <p className="text-sm font-semibold text-white">
                      {candidate.degree}
                      {candidate.branch && ` - ${candidate.branch}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-pink-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Pass Out Year</p>
                    <p className="text-sm font-semibold text-white">{candidate.passOutYear}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-yellow-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">CGPA</p>
                    <p className="text-sm font-semibold text-white">
                      {candidate.cgpa ? `${candidate.cgpa} / 10` : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-300 border border-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <Badge variant={candidate.isEligible ? 'success' : 'error'}>
                    {candidate.isEligible ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Stage</span>
                  <Badge variant="info">{candidate.currentStage?.name || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Added On</span>
                  <span className="text-sm text-white">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stage Progress */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Stage Progress</h3>
              <div className="space-y-2">
                {stages.map((stage, index) => {
                  const isCurrent = stage.id === candidate.currentStageId;
                  const isPassed =
                    stages.findIndex((s) => s.id === candidate.currentStageId) > index;

                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : isPassed
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-slate-800/50 border border-slate-700/50'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isCurrent
                            ? 'bg-purple-500 text-white'
                            : isPassed
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isCurrent || isPassed ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {stage.name}
                        </p>
                        <p className="text-xs text-slate-500">{stage.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowMoveModal(true)}
                >
                  Move to Next Stage
                </Button>
                {candidate.resumeLink && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(candidate.resumeLink!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/candidates?jdId=${candidate.jdId}`)}
                >
                  Back to List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Move Stage Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move Candidate to Stage"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a stage</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={moveNotes}
              onChange={(e) => setMoveNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add any notes about this stage movement..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveStage} disabled={!selectedStage}>
              Move Candidate
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
