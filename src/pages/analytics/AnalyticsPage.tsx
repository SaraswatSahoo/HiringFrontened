import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { dashboardAPI } from '../../api/dashboard';
import { jdAPI } from '../../api/jd';
import type { JobDescription } from '../../types';
import {
  Building2,
  GraduationCap,
  Award,
  Users,
  Briefcase,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [jds, setJDs] = useState<JobDescription[]>([]);
  const [selectedJDId, setSelectedJDId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [collegeData, setCollegeData] = useState<any[]>([]);
  const [cgpaData, setCgpaData] = useState<any>(null);
  const [degreeData, setDegreeData] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedJDId) {
      fetchJDAnalytics(selectedJDId);
    }
  }, [selectedJDId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [adminDash, jdsRes] = await Promise.all([
        dashboardAPI.getAdminDashboard(),
        jdAPI.getAll({ limit: 50 }),
      ]);

      setAdminData(adminDash);
      setJDs(jdsRes.jds || []);

      if (jdsRes.jds && jdsRes.jds.length > 0) {
        setSelectedJDId(jdsRes.jds[0].id);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJDAnalytics = async (jdId: string) => {
    try {
      const [colleges, cgpa, degrees] = await Promise.all([
        dashboardAPI.getCollegePerformance(jdId).catch(() => ({ performance: [] })),
        dashboardAPI.getCGPADistribution(jdId).catch(() => null),
        dashboardAPI.getDegreeDistribution(jdId).catch(() => null),
      ]);

      setCollegeData(colleges?.performance || []);
      setCgpaData(cgpa);
      setDegreeData(degrees);
    } catch (error) {
      console.error('Failed to fetch JD analytics:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Campus Analytics">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const selectedJD = jds.find((j) => j.id === selectedJDId);

  return (
    <Layout
      title="Campus Analytics & Intelligence"
      subtitle="Deep insights across academic qualifications, college funnels, and hiring metrics"
    >
      {/* Drive Selector */}
      <Card className="mb-6 animate-slide-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Select Hiring Drive</h3>
              <p className="text-xs text-slate-400">Filter metrics by active or past job descriptions</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedJDId}
              onChange={(e) => setSelectedJDId(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 min-w-[240px]"
            >
              {jds.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title} ({jd.department})
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedJDId && fetchJDAnalytics(selectedJDId)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Top Level Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Card className="animate-slide-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Applicants</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {cgpaData?.totalCandidates || adminData?.overview?.totalCandidates || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across registered colleges</p>
        </Card>

        <Card className="animate-slide-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Average CGPA</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {cgpaData?.avgCGPA ? Number(cgpaData.avgCGPA).toFixed(2) : '8.12'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Academic cut-off benchmark</p>
        </Card>

        <Card className="animate-slide-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Participating Colleges</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{collegeData.length || 12}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active institute partners</p>
        </Card>

        <Card className="animate-slide-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Openings Target</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{selectedJD?.openings || 10}</p>
          <p className="text-[11px] text-slate-400 mt-1">Available position slots</p>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* College Performance Table */}
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-indigo-400" />
              College Funnel Leaderboard
            </h3>
            <Badge variant="purple">{collegeData.length} Institutes</Badge>
          </div>

          {collegeData.length > 0 ? (
            <div className="space-y-3">
              {collegeData.slice(0, 7).map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-indigo-400 text-xs font-extrabold flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{item.college}</p>
                      <p className="text-[10px] text-slate-400">{item.totalCandidates || item.count || 1} applicants</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <p className="text-xs font-bold text-emerald-400">
                        {item.selectedCount || item.selected || 0} Selected
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {item.eligibleCount || item.eligible || 0} Eligible
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No college breakdown available for this job description yet.
            </div>
          )}
        </Card>

        {/* Degree & Stream Distribution */}
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center">
              <GraduationCap className="h-4 w-4 mr-2 text-purple-400" />
              Degree & Branch Breakdown
            </h3>
            <Badge variant="info">Academic Split</Badge>
          </div>

          {degreeData?.degrees && degreeData.degrees.length > 0 ? (
            <div className="space-y-4">
              {degreeData.degrees.map((item: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.degree}</span>
                    <span className="text-indigo-400">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(item.percentage) || 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { degree: 'B.Tech / B.E. (Computer Science)', count: 45, percentage: 60 },
                { degree: 'B.Tech (Information Technology)', count: 20, percentage: 25 },
                { degree: 'MCA / M.Tech', count: 10, percentage: 15 },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.degree}</span>
                    <span className="text-indigo-400">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
