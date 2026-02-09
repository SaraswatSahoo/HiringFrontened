import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { candidateAPI, type CandidateFilters } from '../../api/candidate';
import { jdAPI } from '../../api/jd';
import type { Candidate, JobDescription, Stage } from '../../types';
import {
  Search,
  Filter,
  Download,
  ArrowRight,
  ExternalLink,
  Users,
  RefreshCw,
  X,
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

export const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jdId = searchParams.get('jdId');
  const preSelectedStageId = searchParams.get('stageId');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jd, setJD] = useState<JobDescription | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [movingCandidates, setMovingCandidates] = useState(false);

  const [filters, setFilters] = useState<CandidateFilters>({
    search: '',
    stageId: preSelectedStageId || undefined,
    isEligible: undefined,
    applicationStatus: undefined,
    offerStatus: undefined,
    college: '',
    degree: '',
    branch: '',
    stream: '',
    passOutYear: undefined,
    minCGPA: undefined,
    maxCGPA: undefined,
    city: '',
    state: '',
    hasWorkExperience: undefined,
    hasJoined: undefined,
    gender: undefined,
    skills: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    if (jdId) {
      fetchData();
    }
  }, [jdId, page]);

  useEffect(() => {
    if (jdId && page !== 1) {
      setPage(1);
    } else if (jdId) {
      fetchData();
    }
  }, [filters]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);

      // Clean filters - remove empty strings and undefined values
      const cleanFilters: CandidateFilters = {
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
        ),
      };

      const [candidatesData, jdData] = await Promise.all([
        candidateAPI.getByJD(jdId!, cleanFilters),
        jdAPI.getById(jdId!),
      ]);

      setCandidates(candidatesData.candidates);
      setTotalPages(candidatesData.pagination.totalPages);
      setTotalCandidates(candidatesData.pagination.total);
      setJD(jdData.jd);
      setStages(jdData.jd.stages || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBulkMove = async () => {
    if (!targetStage || selectedIds.length === 0) return;

    try {
      setMovingCandidates(true);
      await candidateAPI.bulkMoveStage({
        candidateIds: selectedIds,
        stageId: targetStage,
      });
      setShowMoveModal(false);
      setSelectedIds([]);
      setTargetStage('');
      await fetchData(true);
    } catch (error) {
      console.error('Failed to move candidates:', error);
      alert('Failed to move candidates. Please try again.');
    } finally {
      setMovingCandidates(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((c) => c.id));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      stageId: undefined,
      isEligible: undefined,
      applicationStatus: undefined,
      offerStatus: undefined,
      college: '',
      degree: '',
      branch: '',
      stream: '',
      passOutYear: undefined,
      minCGPA: undefined,
      maxCGPA: undefined,
      city: '',
      state: '',
      hasWorkExperience: undefined,
      hasJoined: undefined,
      gender: undefined,
      skills: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, v]) =>
      v !== '' &&
      v !== undefined &&
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      key !== 'search'
  );

  const handleExport = async () => {
    try {
      // TODO: Implement actual CSV export from backend
      const csvContent = candidates.map(c => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        College: c.college,
        Degree: c.degree,
        Branch: c.branch || 'N/A',
        CGPA: c.cgpa || 'N/A',
        PassOutYear: c.passOutYear,
        Eligible: c.isEligible ? 'Yes' : 'No',
        Stage: c.currentStage?.name || 'N/A',
      }));
      
      const csv = [
        Object.keys(csvContent[0]).join(','),
        ...csvContent.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${jd?.title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const columns = [
    {
      key: 'select',
      label: '',
      render: (candidate: Candidate) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(candidate.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelection(candidate.id);
          }}
          className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (candidate: Candidate) => (
        <div>
          <p className="font-semibold text-white hover:text-purple-400 transition-colors">
            {candidate.name}
          </p>
          <p className="text-xs text-slate-400">{candidate.email}</p>
        </div>
      ),
    },
    {
      key: 'college',
      label: 'College',
      render: (candidate: Candidate) => (
        <div>
          <p className="text-sm text-slate-200">{candidate.college}</p>
          <p className="text-xs text-slate-400">
            {candidate.degree}
            {candidate.branch && ` - ${candidate.branch}`}
            {candidate.stream && ` (${candidate.stream})`}
          </p>
        </div>
      ),
    },
    {
      key: 'academics',
      label: 'Academics',
      render: (candidate: Candidate) => (
        <div>
          <p className="text-sm text-slate-200">
            CGPA: {candidate.cgpa ? Number(candidate.cgpa).toFixed(2) : 'N/A'}
          </p>
          <p className="text-xs text-slate-400">Year: {candidate.passOutYear}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (candidate: Candidate) => (
        <div className="space-y-1">
          <Badge variant={candidate.isEligible ? 'success' : 'error'}>
            {candidate.isEligible ? 'Eligible' : 'Not Eligible'}
          </Badge>
          {candidate.applicationStatus && (
            <Badge variant="info">
              {candidate.applicationStatus}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (candidate: Candidate) => (
        <Badge variant="info">{candidate.currentStage?.name || 'N/A'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (candidate: Candidate) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {candidate.resumeLink && (
            <a
              href={candidate.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              title="View Resume"
            >
              <ExternalLink className="h-4 w-4 text-blue-400" />
            </a>
          )}
          <button
            onClick={() => navigate(`/candidates/${candidate.id}`)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <ArrowRight className="h-4 w-4 text-purple-400" />
          </button>
        </div>
      ),
    },
  ];

  if (!jdId) {
    return (
      <Layout title="Candidates">
        <Card className="animate-fade-in">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <Users className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No JD Selected</h3>
            <p className="text-slate-400 mb-6">
              Please select a job description to view its candidates
            </p>
            <Button onClick={() => navigate('/jobs')}>View Job Descriptions</Button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      title={jd?.title || 'Candidates'}
      subtitle={`${totalCandidates} ${totalCandidates === 1 ? 'candidate' : 'candidates'} • ${jd?.department || 'Loading...'}`}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 animate-slide-in-up">
        <div className="flex items-center space-x-3">
          {selectedIds.length > 0 && (
            <Badge variant="info" className="text-sm">
              {selectedIds.length} selected
            </Badge>
          )}
          {hasActiveFilters && (
            <Badge variant="warning" className="text-sm">
              Filters active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${jdId}`)}>
            View JD Details
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="space-y-4">
          {/* Search and Bulk Actions */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search by name, email, phone, college..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <Button onClick={() => fetchData()} variant="secondary" size="md">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {selectedIds.length > 0 && (
              <Button onClick={() => setShowMoveModal(true)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Move ({selectedIds.length})
              </Button>
            )}
          </div>

          {/* Basic Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400 shrink-0" />
            
            {/* Stage Filter */}
            <select
              value={filters.stageId || ''}
              onChange={(e) => setFilters({ ...filters, stageId: e.target.value || undefined })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Stages</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>

            {/* Eligibility Filter */}
            <select
              value={filters.isEligible === undefined ? '' : String(filters.isEligible)}
              onChange={(e) => 
                setFilters({ 
                  ...filters, 
                  isEligible: e.target.value === '' ? undefined : e.target.value === 'true' 
                })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Eligibility</option>
              <option value="true">Eligible Only</option>
              <option value="false">Not Eligible</option>
            </select>

            {/* Application Status Filter */}
            <select
              value={filters.applicationStatus || ''}
              onChange={(e) => 
                setFilters({ 
                  ...filters, 
                  applicationStatus: e.target.value as any || undefined 
                })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Application Status</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="PROCESSED">Processed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* College Filter */}
            <input
              type="text"
              value={filters.college || ''}
              onChange={(e) => setFilters({ ...filters, college: e.target.value })}
              placeholder="Filter by college..."
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-37.5"
            />

            {/* Pass Out Year Filter */}
            <input
              type="number"
              value={filters.passOutYear || ''}
              onChange={(e) => 
                setFilters({ 
                  ...filters, 
                  passOutYear: e.target.value ? Number(e.target.value) : undefined 
                })
              }
              placeholder="Year..."
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
              min="2020"
              max="2035"
            />

            {/* Advanced Filters Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="ml-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Advanced
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-slate-700 space-y-3 animate-slide-in-up">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Advanced Filters</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Degree */}
                <input
                  type="text"
                  value={filters.degree || ''}
                  onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                  placeholder="Degree (e.g., B.Tech)"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Branch */}
                <input
                  type="text"
                  value={filters.branch || ''}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  placeholder="Branch (e.g., CSE)"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Stream */}
                <input
                  type="text"
                  value={filters.stream || ''}
                  onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
                  placeholder="Stream"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Min CGPA */}
                <input
                  type="number"
                  value={filters.minCGPA || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      minCGPA: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                  placeholder="Min CGPA"
                  step="0.1"
                  min="0"
                  max="10"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Max CGPA */}
                <input
                  type="number"
                  value={filters.maxCGPA || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      maxCGPA: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                  placeholder="Max CGPA"
                  step="0.1"
                  min="0"
                  max="10"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* City */}
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="City"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* State */}
                <input
                  type="text"
                  value={filters.state || ''}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder="State"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Skills */}
                <input
                  type="text"
                  value={filters.skills || ''}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  placeholder="Skills (comma-separated)"
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Gender */}
                <select
                  value={filters.gender || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      gender: e.target.value as any || undefined 
                    })
                  }
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {/* Work Experience */}
                <select
                  value={filters.hasWorkExperience === undefined ? '' : String(filters.hasWorkExperience)}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      hasWorkExperience: e.target.value === '' ? undefined : e.target.value === 'true' 
                    })
                  }
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any Experience</option>
                  <option value="true">With Experience</option>
                  <option value="false">Freshers Only</option>
                </select>

                {/* Offer Status */}
                <select
                  value={filters.offerStatus || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      offerStatus: e.target.value as any || undefined 
                    })
                  }
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Offer Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="SENT">Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>

                {/* Has Joined */}
                <select
                  value={filters.hasJoined === undefined ? '' : String(filters.hasJoined)}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      hasJoined: e.target.value === '' ? undefined : e.target.value === 'true' 
                    })
                  }
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Joining Status</option>
                  <option value="true">Joined</option>
                  <option value="false">Not Joined</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="college">College</option>
                  <option value="cgpa">CGPA</option>
                  <option value="passOutYear">Pass Out Year</option>
                  <option value="appliedAt">Applied Date</option>
                  <option value="lastActivityAt">Last Activity</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Candidates Table */}
      <Card className="animate-fade-in">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : candidates.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedIds.length === candidates.length && candidates.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-sm text-slate-400">
                  {selectedIds.length > 0
                    ? `${selectedIds.length} of ${candidates.length} selected`
                    : `${totalCandidates} total candidates`}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Table
              data={candidates}
              columns={columns}
              onRowClick={(c) => navigate(`/candidates/${c.id}`)}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          page === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-slate-500">...</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <AlertCircle className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Candidates Found</h3>
            <p className="text-sm text-slate-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search criteria'
                : 'Upload candidates to get started'}
            </p>
            {hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate(`/bulk-upload?jdId=${jdId}`)}>
                <Users className="h-4 w-4 mr-2" />
                Upload Candidates
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Bulk Move Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => !movingCandidates && setShowMoveModal(false)}
        title="Move Candidates to Stage"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Select a stage to move <span className="font-semibold text-white">{selectedIds.length}</span> candidate(s)
          </p>
          <select
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={movingCandidates}
          >
            <option value="">Select Stage</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name} ({stage.type})
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setShowMoveModal(false)}
              disabled={movingCandidates}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkMove}
              disabled={!targetStage}
              loading={movingCandidates}
            >
              Move Candidates
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
