import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { StageChart } from '../../components/charts/StageChart';
import { CollegeChart } from '../../components/charts/CollegeChart';
import { CGPAChart } from '../../components/charts/CGPAChart';
import { jdAPI } from '../../api/jd';
import { dashboardAPI } from '../../api/dashboard';
import { bulkAPI } from '../../api/bulk';
import type { JobDescription } from '../../types';
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
  Download,
} from 'lucide-react';

export const JDDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jd, setJD] = useState<JobDescription | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [stageStats, setStageStats] = useState<any>(null);
  const [collegePerf, setCollegePerf] = useState<any[]>([]);
  const [cgpaData, setCgpaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [markingEligible, setMarkingEligible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJDDetails();
    }
  }, [id]);

  const fetchJDDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);

      const [jdData, summaryData, stagesData, collegeData, cgpaDistData] = await Promise.all([
        jdAPI.getById(id!),
        dashboardAPI.getSummary(id!),
        dashboardAPI.getStageStats(id!),
        dashboardAPI.getCollegePerformance(id!),
        dashboardAPI.getCGPADistribution(id!),
      ]);
      
      setJD(jdData.jd);
      setStages(jdData.stages);
      setSummary(summaryData.summary);
      setStageStats(stagesData);
      setCollegePerf(collegeData.performance);
      setCgpaData(cgpaDistData);
    } catch (error) {
      console.error('Failed to fetch JD details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === jd?.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setStatusChanging(true);
      await jdAPI.updateStatus(id!, newStatus);
      setShowStatusModal(false);
      await fetchJDDetails(true);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleMarkEligible = async () => {
    if (!confirm('This will re-evaluate eligibility for all candidates in this JD based on current criteria. Continue?')) {
      return;
    }

    try {
      setMarkingEligible(true);
      const result = await bulkAPI.markEligible(id!);
      alert(
        `Eligibility Updated!\n\n` +
        `Total Candidates: ${result.totalCandidates}\n` +
        `Eligible: ${result.eligibleCount}\n` +
        `Not Eligible: ${result.notEligibleCount}`
      );
      await fetchJDDetails(true);
    } catch (error) {
      console.error('Failed to mark eligible:', error);
      alert('Failed to update eligibility. Please try again.');
    } finally {
      setMarkingEligible(false);
    }
  };

  const handleRefresh = () => {
    fetchJDDetails(true);
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

  const stats = [
    {
      label: 'Total Candidates',
      value: summary?.totalCandidates || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+' + (summary?.totalCandidates || 0),
    },
    {
      label: 'Eligible',
      value: summary?.eligibleCandidates || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      percentage: summary?.eligibilityRate || '0%',
    },
    {
      label: 'Shortlisted',
      value: summary?.shortlisted || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+' + (summary?.shortlisted || 0),
    },
    {
      label: 'Selected',
      value: summary?.selected || 0,
      icon: Award,
      color: 'from-orange-500 to-yellow-500',
      percentage: summary?.selectionRate || '0%',
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
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button variant="ghost" onClick={() => setShowStatusModal(true)}>
          Change Status
        </Button>

        <Button variant="ghost" onClick={() => navigate(`/jobs/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>

        <Button 
          variant="secondary" 
          onClick={handleMarkEligible}
          loading={markingEligible}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Eligible
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

      {/* JD Info Card */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  ₹{((jd.salaryMin || 0) / 100000).toFixed(1)}L - ₹{((jd.salaryMax || 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Openings</p>
              <p className="text-sm font-semibold text-white">{jd.openings || 0} positions</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Description</h4>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{jd.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Eligibility Criteria</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <p className="text-xs text-slate-500 mb-2">Minimum CGPA</p>
              <span className="px-3 py-1 text-sm rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {jd.minCGPA?.toFixed(2) || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hover className={`animate-slide-in-up [animation-delay:${index * 100}ms]`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`} />
            <div className="relative">
              <div className={`inline-flex p-3 rounded-lg bg-linear-to-br ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
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

      {/* Charts Grid */}
      {(stageStats?.stages?.length > 0 || collegePerf?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {stageStats?.stages && stageStats.stages.length > 0 && (
            <div className="animate-fade-in">
              <StageChart data={stageStats.stages} />
            </div>
          )}
          {collegePerf?.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CollegeChart data={collegePerf} />
            </div>
          )}
        </div>
      )}

      {cgpaData?.distribution && Object.keys(cgpaData.distribution).length > 0 && (
        <div className="mb-8 animate-fade-in">
          <CGPAChart data={cgpaData.distribution} />
        </div>
      )}

      {/* Stages Table */}
      {stages.length > 0 && (
        <Card className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Hiring Stages</h3>
            <Badge variant="info">{stages.length} stages</Badge>
          </div>
          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/candidates?jdId=${id}&stageId=${stage.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-semibold text-sm">
                    {stage.order || index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stage.name}</p>
                    <p className="text-xs text-slate-400">{stage.type}</p>
                  </div>
                </div>
                <Badge variant={stage.type === 'SELECTED' ? 'success' : 'default'}>
                  {stageStats?.stages?.find((s: any) => s.stageId === stage.id)?.count || 0} candidates
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Colleges */}
      {collegePerf?.length > 0 && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Performing Colleges</h3>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                    College
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    Applied
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    Eligible
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    Shortlisted
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    Selected
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">
                    Avg CGPA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {collegePerf.slice(0, 10).map((college, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-400 font-medium">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{college.collegeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-center">
                      {college.totalApplied}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-center">
                      {college.totalEligible}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-center">
                      {college.totalShortlisted}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-400 text-center font-semibold">
                      {college.totalSelected}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-400 text-center font-semibold">
                      {college.avgCGPA || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          {['ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT'].map((status) => (
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
