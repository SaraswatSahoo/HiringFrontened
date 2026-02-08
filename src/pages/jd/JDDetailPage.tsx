import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { jdAPI } from '../../api/jd';
import type { JobDescription, Stage, JDStats, JDStatus } from '../../types';
import {
  Users,
  MapPin,
  Building2,
  DollarSign,
  Upload,
  Edit,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Clock,
  Monitor,
  Code,
  GraduationCap,
} from 'lucide-react';

export const JDDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [jd, setJD] = useState<JobDescription | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [stats, setStats] = useState<JDStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJDDetails();
    } else {
      setError('No job ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchJDDetails = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      setRefreshing(silent);

      if (!id) {
        throw new Error('Job ID is required');
      }

      const [jdData, statsData] = await Promise.all([
        jdAPI.getById(id),
        jdAPI.getStats(id),
      ]);

      if (!jdData || !jdData.jd) {
        throw new Error('Invalid response from server');
      }

      setJD(jdData.jd);
      setStats(statsData?.stats || null);
      
      // Get stages from JD data or fetch separately
      if (jdData.jd.stages && jdData.jd.stages.length > 0) {
        setStages(jdData.jd.stages);
      } else {
        try {
          const stagesData = await jdAPI.getStages(id);
          setStages(stagesData?.stages || []);
        } catch (stageError) {
          console.warn('Failed to fetch stages:', stageError);
          setStages([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch JD details:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch JD details';
      setError(errorMessage);
      
      // If 404, show not found
      if (error.response?.status === 404) {
        setJD(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus: JDStatus) => {
    if (newStatus === jd?.status) {
      setShowStatusModal(false);
      return;
    }

    if (!id) return;

    try {
      setStatusChanging(true);
      await jdAPI.updateStatus(id, newStatus);
      setShowStatusModal(false);
      await fetchJDDetails(true);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update status';
      alert(errorMessage);
    } finally {
      setStatusChanging(false);
    }
  };

  const handleRefresh = () => {
    fetchJDDetails(true);
  };

  const handleDuplicate = async () => {
    if (!window.confirm('Create a duplicate of this Job Description?')) {
      return;
    }

    if (!id) return;

    try {
      const { jd: duplicatedJD } = await jdAPI.duplicate(id);
      navigate(`/jobs/${duplicatedJD.id}`);
    } catch (error: any) {
      console.error('Failed to duplicate JD:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to duplicate JD';
      alert(errorMessage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && !jd) {
    return (
      <Layout title="Error">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {error.includes('404') || error.includes('not found') 
              ? 'Job Description Not Found' 
              : 'Error Loading Job Description'}
          </h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => navigate('/jobs')} variant="secondary">
              Back to JDs
            </Button>
            <Button onClick={() => fetchJDDetails()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Not found state
  if (!jd) {
    return (
      <Layout title="Not Found">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Job Description Not Found</h3>
          <p className="text-slate-400 mb-6">The JD you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/jobs')}>Back to JDs</Button>
        </div>
      </Layout>
    );
  }

  const summaryStats = [
    {
      label: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Eligible',
      value: stats?.eligibleCandidates || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      percentage: stats?.totalCandidates 
        ? `${((stats.eligibleCandidates / stats.totalCandidates) * 100).toFixed(1)}%`
        : '0%',
    },
    {
      label: 'Ineligible',
      value: stats?.ineligibleCandidates || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Fill Rate',
      value: stats?.fillRate || '0',
      icon: Award,
      color: 'from-orange-500 to-yellow-500',
      suffix: '%',
    },
  ];

  return (
    <Layout title={jd.title} subtitle={jd.department}>
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-in-up">
        <Badge
          variant={
            jd.status === 'ACTIVE'
              ? 'success'
              : jd.status === 'PAUSED'
              ? 'warning'
              : jd.status === 'CLOSED'
              ? 'error'
              : 'default'
          }
        >
          {jd.status}
        </Badge>
        <div className="flex-1" />

        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button variant="ghost" onClick={() => setShowStatusModal(true)}>
          Change Status
        </Button>

        <Button variant="ghost" onClick={() => navigate(`/jobs/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>

        <Button variant="secondary" onClick={handleDuplicate}>
          Duplicate
        </Button>

        <Button onClick={() => navigate(`/bulk-upload?jdId=${id}`)}>
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>

        <Button variant="secondary" onClick={() => navigate(`/candidates?jdId=${id}`)}>
          <Users className="h-4 w-4 mr-2" />
          View Candidates
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryStats.map((stat, index) => (
          <Card
            key={index}
            hover
            className="animate-slide-in-up"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}
            />
            <div className="relative">
              <div className={`inline-flex p-3 rounded-lg bg-linear-to-br ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {stat.value}
                {stat.suffix}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{stat.label}</p>
                {stat.percentage && (
                  <span className="text-xs text-green-400 font-semibold">{stat.percentage}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* JD Info Card */}
      <Card className="mb-6 animate-slide-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-purple-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Department</p>
              <p className="text-sm font-semibold text-white">{jd.department}</p>
            </div>
          </div>

          {jd.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-teal-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Location</p>
                <p className="text-sm font-semibold text-white">{jd.location}</p>
              </div>
            </div>
          )}

          {(jd.salaryMin || jd.salaryMax) && (
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Salary Range</p>
                <p className="text-sm font-semibold text-white">
                  ₹{((jd.salaryMin || 0) / 100000).toFixed(1)}L - ₹
                  {((jd.salaryMax || 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Openings</p>
              <p className="text-sm font-semibold text-white">{jd.openings} positions</p>
            </div>
          </div>

          {jd.employmentType && (
            <div className="flex items-start space-x-3">
              <Briefcase className="h-5 w-5 text-pink-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Employment Type</p>
                <p className="text-sm font-semibold text-white">{jd.employmentType}</p>
              </div>
            </div>
          )}

          {jd.experienceLevel && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Experience Level</p>
                <p className="text-sm font-semibold text-white">{jd.experienceLevel}</p>
              </div>
            </div>
          )}

          {jd.workMode && (
            <div className="flex items-start space-x-3">
              <Monitor className="h-5 w-5 text-cyan-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">Work Mode</p>
                <p className="text-sm font-semibold text-white">{jd.workMode}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Description</h4>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
            {jd.description}
          </p>
        </div>

        {jd.responsibilities && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Responsibilities</h4>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
              {jd.responsibilities}
            </p>
          </div>
        )}

        {jd.skills && jd.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center space-x-2 mb-3">
              <Code className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-slate-300">Required Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {jd.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-slate-300">Eligibility Criteria</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jd.eligibleDegrees && jd.eligibleDegrees.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Eligible Degrees</p>
                <div className="flex flex-wrap gap-2">
                  {jd.eligibleDegrees.map((degree, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    >
                      {degree}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jd.eligibleStreams && jd.eligibleStreams.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Eligible Streams</p>
                <div className="flex flex-wrap gap-2">
                  {jd.eligibleStreams.map((stream, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30"
                    >
                      {stream}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jd.eligibleYears && jd.eligibleYears.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Eligible Years</p>
                <div className="flex flex-wrap gap-2">
                  {jd.eligibleYears.map((year, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-2">Minimum CGPA</p>
              <span className="px-3 py-1 text-sm rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {jd.minCGPA 
                  ? (typeof jd.minCGPA === 'number' 
                      ? jd.minCGPA.toFixed(2) 
                      : parseFloat(String(jd.minCGPA)).toFixed(2))
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

      </Card>

      {/* Stages Table */}
      {stages && stages.length > 0 && (
        <Card className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Hiring Stages</h3>
            <Badge variant="info">{stages.length} stages</Badge>
          </div>
          <div className="space-y-2">
            {stages.map((stage) => {
              const stageCount =
                stats?.stages?.find((s) => s.name === stage.name)?.count || 0;
              return (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/candidates?jdId=${id}&stageId=${stage.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-sm">
                      {stage.order}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{stage.name}</p>
                      <p className="text-xs text-slate-400">{stage.type}</p>
                    </div>
                  </div>
                  <Badge variant={stage.type === 'SELECTED' ? 'success' : 'default'}>
                    {stageCount} candidates
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => !statusChanging && setShowStatusModal(false)}
        title="Change JD Status"
        size="sm"
      >
        <div className="space-y-3">
          {(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={statusChanging}
              className={`w-full p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                jd.status === status
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <p className="font-semibold text-white">{status}</p>
              <p className="text-xs text-slate-400 mt-1">
                {status === 'ACTIVE' && 'Candidates can be added and moved'}
                {status === 'PAUSED' && 'Hiring temporarily on hold'}
                {status === 'CLOSED' && 'Position filled, no new candidates'}
                {status === 'DRAFT' && 'Not yet published'}
              </p>
            </button>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};
