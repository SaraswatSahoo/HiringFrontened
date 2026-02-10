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
import type { Candidate, Stage, MoveStageData } from '../../types';
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
  MapPin,
  Briefcase,
  Code,
  Trophy,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
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
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMode, setInterviewMode] = useState<'Online' | 'Offline' | 'Telephonic' | 'Video'>('Online');
  const [interviewerName, setInterviewerName] = useState('');

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
        const { jd } = await jdAPI.getById(candidateData.jdId);
        setStages(jd.stages || []);
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
      const moveData: MoveStageData = {
        stageId: selectedStage,
        notes: moveNotes || undefined,
        interviewDate: interviewDate || undefined,
        interviewMode: interviewMode,
        interviewerName: interviewerName || undefined,
      };

      await candidateAPI.moveStage(id!, moveData);
      setShowMoveModal(false);
      setSelectedStage('');
      setMoveNotes('');
      setInterviewDate('');
      setInterviewerName('');
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

  const handleSendEmail = () => {
    if (!candidate) return;
    navigate(`/emails/send?candidateId=${candidate.id}&jdId=${candidate.jdId}`);
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
      <div className="max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-in-up">
          <Badge variant={candidate.isEligible ? 'success' : 'error'}>
            {candidate.isEligible ? 'Eligible' : 'Not Eligible'}
          </Badge>
          {candidate.currentStage && (
            <Badge variant="info">{candidate.currentStage.name}</Badge>
          )}
          {candidate.applicationStatus && (
            <Badge variant="warning">{candidate.applicationStatus}</Badge>
          )}
          {candidate.offerStatus && (
            <Badge variant="success">{candidate.offerStatus}</Badge>
          )}
          <div className="flex-1" />
          {/* Email action – header */}
          <Button variant="secondary" size="sm" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowMoveModal(true)}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Move Stage
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-400" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-purple-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-sm text-white hover:text-purple-400 break-all"
                    >
                      {candidate.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-teal-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Phone</p>
                    <a
                      href={`tel:${candidate.phone}`}
                      className="text-sm text-white hover:text-teal-400 block"
                    >
                      {candidate.phone}
                    </a>
                    {candidate.alternatePhone && (
                      <a
                        href={`tel:${candidate.alternatePhone}`}
                        className="text-xs text-slate-400 hover:text-teal-400 block mt-1"
                      >
                        Alt: {candidate.alternatePhone}
                      </a>
                    )}
                  </div>
                </div>

                {candidate.dateOfBirth && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-pink-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Date of Birth</p>
                      <p className="text-sm text-white">
                        {new Date(candidate.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.gender && (
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-indigo-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Gender</p>
                      <p className="text-sm text-white">{candidate.gender}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Location Details */}
            {(candidate.address || candidate.city || candidate.state) && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-400" />
                  Location
                </h3>
                <div className="space-y-3">
                  {candidate.address && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Address</p>
                      <p className="text-sm text-white">{candidate.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {candidate.city && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">City</p>
                        <p className="text-sm text-white">{candidate.city}</p>
                      </div>
                    )}
                    {candidate.state && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">State</p>
                        <p className="text-sm text-white">{candidate.state}</p>
                      </div>
                    )}
                    {candidate.pincode && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Pincode</p>
                        <p className="text-sm text-white">{candidate.pincode}</p>
                      </div>
                    )}
                    {candidate.country && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Country</p>
                        <p className="text-sm text-white">{candidate.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Academic Details */}
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-400" />
                Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-orange-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">College</p>
                    <p className="text-sm font-semibold text-white">{candidate.college}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-green-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Degree</p>
                    <p className="text-sm font-semibold text-white">{candidate.degree}</p>
                  </div>
                </div>

                {candidate.branch && (
                  <div className="flex items-start space-x-3">
                    <Code className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Branch</p>
                      <p className="text-sm text-white">{candidate.branch}</p>
                    </div>
                  </div>
                )}

                {candidate.stream && (
                  <div className="flex items-start space-x-3">
                    <Code className="h-5 w-5 text-cyan-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Stream</p>
                      <p className="text-sm text-white">{candidate.stream}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-pink-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Pass Out Year</p>
                    <p className="text-sm font-semibold text-white">{candidate.passOutYear}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-yellow-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">CGPA</p>
                    <p className="text-sm font-semibold text-white">
                      {candidate.cgpa ? `${Number(candidate.cgpa).toFixed(2)} / 10` : 'Not Available'}
                    </p>
                  </div>
                </div>

                {candidate.backlogs !== undefined && (
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Backlogs</p>
                      <p className="text-sm text-white">
                        {candidate.backlogs}
                        {candidate.activeBacklogs !== undefined && ` (Active: ${candidate.activeBacklogs})`}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.tenthPercentage && (
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-green-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">10th Percentage</p>
                      <p className="text-sm text-white">{Number(candidate.tenthPercentage).toFixed(2)}%</p>
                    </div>
                  </div>
                )}

                {candidate.twelfthPercentage && (
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 mb-1">12th Percentage</p>
                      <p className="text-sm text-white">{Number(candidate.twelfthPercentage).toFixed(2)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Experience & Skills */}
            {(candidate.hasWorkExperience || candidate.skills?.length || candidate.certifications?.length) && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
                  Experience & Skills
                </h3>
                <div className="space-y-4">
                  {candidate.hasWorkExperience && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Work Experience</p>
                      <p className="text-sm text-white">
                        {candidate.yearsOfExperience 
                          ? `${Number(candidate.yearsOfExperience).toFixed(1)} years` 
                          : 'Experienced'}
                      </p>
                    </div>
                  )}

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.certifications && candidate.certifications.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30"
                          >
                            <Trophy className="h-3 w-3 inline mr-1" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.projects && candidate.projects.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Projects</p>
                      <ul className="space-y-1">
                        {candidate.projects.map((project, index) => (
                          <li key={index} className="text-sm text-white flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            {project}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {candidate.internships && candidate.internships.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Internships</p>
                      <ul className="space-y-1">
                        {candidate.internships.map((internship, index) => (
                          <li key={index} className="text-sm text-white flex items-start">
                            <span className="text-teal-400 mr-2">•</span>
                            {internship}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Assessment Scores */}
            {(candidate.interviewScore || candidate.technicalScore || candidate.hrScore || candidate.overallRating) && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-400" />
                  Assessment Scores
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {candidate.interviewScore !== undefined && (
                    <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Interview</p>
                      <p className="text-2xl font-bold text-white">{Number(candidate.interviewScore).toFixed(0)}</p>
                      <p className="text-xs text-slate-500">/ 100</p>
                    </div>
                  )}
                  {candidate.technicalScore !== undefined && (
                    <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Technical</p>
                      <p className="text-2xl font-bold text-white">{Number(candidate.technicalScore).toFixed(0)}</p>
                      <p className="text-xs text-slate-500">/ 100</p>
                    </div>
                  )}
                  {candidate.hrScore !== undefined && (
                    <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">HR Round</p>
                      <p className="text-2xl font-bold text-white">{Number(candidate.hrScore).toFixed(0)}</p>
                      <p className="text-xs text-slate-500">/ 100</p>
                    </div>
                  )}
                  {candidate.overallRating !== undefined && (
                    <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <p className="text-xs text-slate-400 mb-1">Overall</p>
                      <p className="text-2xl font-bold text-purple-400">{Number(candidate.overallRating).toFixed(1)}</p>
                      <p className="text-xs text-slate-500">/ 5.0</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Offer Details */}
            {(candidate.offerStatus || candidate.offeredCTC || candidate.joiningDate) && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Offer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.offerStatus && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Offer Status</p>
                      <Badge variant={
                        candidate.offerStatus === 'ACCEPTED' ? 'success' :
                        candidate.offerStatus === 'SENT' ? 'info' :
                        candidate.offerStatus === 'REJECTED' ? 'error' : 'warning'
                      }>
                        {candidate.offerStatus}
                      </Badge>
                    </div>
                  )}
                  {candidate.offeredCTC && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Offered CTC</p>
                      <p className="text-sm font-semibold text-white">
                        ₹{Number(candidate.offeredCTC).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {candidate.joiningDate && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Joining Date</p>
                      <p className="text-sm text-white">
                        {new Date(candidate.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {candidate.hasJoined !== undefined && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Joining Status</p>
                      <Badge variant={candidate.hasJoined ? 'success' : 'warning'}>
                        {candidate.hasJoined ? 'Joined' : 'Not Joined'}
                      </Badge>
                    </div>
                  )}
                  {candidate.offerLetterUrl && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-2">Offer Letter</p>
                      <a
                        href={candidate.offerLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Offer Letter
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Documents */}
            {(candidate.resumeLink || candidate.photoUrl || candidate.idProofUrl || candidate.marksheetUrls?.length) && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-400" />
                  Documents
                </h3>
                <div className="space-y-3">
                  {candidate.resumeLink && (
                    <a
                      href={candidate.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-white group-hover:text-purple-400">Resume</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-400" />
                    </a>
                  )}
                  {candidate.photoUrl && (
                    <a
                      href={candidate.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-purple-400" />
                        <span className="text-sm text-white group-hover:text-purple-400">Photo</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-400" />
                    </a>
                  )}
                  {candidate.idProofUrl && (
                    <a
                      href={candidate.idProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-white group-hover:text-purple-400">ID Proof</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-400" />
                    </a>
                  )}
                  {candidate.marksheetUrls && candidate.marksheetUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400">Marksheets</p>
                      {candidate.marksheetUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-orange-400" />
                            <span className="text-sm text-white group-hover:text-purple-400">
                              Marksheet {index + 1}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Ineligibility Reason */}
            {!candidate.isEligible && candidate.ineligibilityReason && (
              <Card className="animate-fade-in border-red-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-400" />
                  Ineligibility Reason
                </h3>
                <p className="text-sm text-red-300 bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                  {candidate.ineligibilityReason}
                </p>
              </Card>
            )}

            {/* Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
              <Card className="animate-fade-in">
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

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Eligibility</span>
                  <Badge variant={candidate.isEligible ? 'success' : 'error'}>
                    {candidate.isEligible ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Stage</span>
                  <Badge variant="info">{candidate.currentStage?.name || 'N/A'}</Badge>
                </div>
                {candidate.applicationStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">App Status</span>
                    <Badge variant="warning">{candidate.applicationStatus}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Applied On</span>
                  <span className="text-sm text-white">
                    {new Date(candidate.appliedAt || candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {candidate.lastActivityAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Last Activity</span>
                    <span className="text-sm text-white">
                      {new Date(candidate.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Stage Progress */}
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-400" />
                Stage Progress
              </h3>
              <div className="space-y-2">
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => {
                    const isCurrent = stage.id === candidate.currentStageId;
                    const currentStageIndex = stages.findIndex((s) => s.id === candidate.currentStageId);
                    const isPassed = currentStageIndex > index;

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-purple-500/20 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : isPassed
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-slate-800/50 border border-slate-700/50'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                            isCurrent
                              ? 'bg-purple-500 text-white'
                              : isPassed
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            stage.order
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
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
            <Card className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                {/* Email action – sidebar */}
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleSendEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowMoveModal(true)}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to Stage
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

            {/* Feedback Summary */}
            {candidate._count?.feedbacks && candidate._count.feedbacks > 0 && (
              <Card className="animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-teal-400" />
                  Feedback
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">
                    {candidate._count.feedbacks}
                  </p>
                  <p className="text-xs text-slate-400">Total Feedbacks</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => navigate(`/candidates/${id}/feedback`)}
                  >
                    View All Feedback
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Move Stage Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Move Candidate to Stage"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Stage <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a stage</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} ({stage.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Interview Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Interview Mode (Optional)
            </label>
            <select
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Telephonic">Telephonic</option>
              <option value="Video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Interviewer Name (Optional)
            </label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="Enter interviewer name..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button variant="ghost" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveStage} disabled={!selectedStage}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Move Candidate
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
