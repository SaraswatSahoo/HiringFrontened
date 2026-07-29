import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { dashboardAPI } from '../../api/dashboard';
import { jdAPI } from '../../api/jd';
import { StageChart } from '../../components/charts/StageChart';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Building2,
  Award,
  Plus,
  Upload,
  BarChart3,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [recentJDs, setRecentJDs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      setRefreshing(silent);

      const [adminDash, jds] = await Promise.all([
        dashboardAPI.getAdminDashboard(),
        jdAPI.getAll({ limit: 5, status: 'ACTIVE' }),
      ]);
      
      setAdminData(adminDash);
      setRecentJDs(jds?.jds || []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-rose-500" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => fetchDashboardData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: 'Total JDs',
      value: adminData?.overview?.totalJDs || 0,
      icon: Briefcase,
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      subtitle: `${adminData?.overview?.activeJDs || 0} active hiring drives`,
    },
    {
      label: 'Active JDs',
      value: adminData?.overview?.activeJDs || 0,
      icon: TrendingUp,
      color: 'from-sky-500 to-indigo-600',
      shadow: 'shadow-sky-500/20',
      subtitle: 'Currently accepting applications',
    },
    {
      label: 'Total Candidates',
      value: adminData?.overview?.totalCandidates || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20',
      subtitle: `${adminData?.overview?.eligibleCandidates || 0} eligible candidates`,
    },
    {
      label: 'Total Selections',
      value: adminData?.overview?.totalSelections || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      subtitle: 'Successfully selected & offered',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout 
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'User'}! 👋`}
      subtitle="Here's real-time visibility across all active campus hiring drives."
    >
      {/* Action Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="animate-slide-in-up"
            hover
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Live Metrics
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</h3>
            <p className="text-xs font-semibold text-slate-300 mb-1">{stat.label}</p>
            {stat.subtitle && (
              <p className="text-[11px] text-slate-400">{stat.subtitle}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active JDs Panel */}
        <Card className="lg:col-span-2 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-indigo-400" />
                Active Job Descriptions
              </h3>
              <p className="text-xs text-slate-400">Manage ongoing drives and target openings</p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center group"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          {recentJDs && recentJDs.length > 0 ? (
            <div className="space-y-3">
              {recentJDs.map((jd, index) => (
                <div
                  key={jd.id}
                  onClick={() => navigate(`/jobs/${jd.id}`)}
                  className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 cursor-pointer transition-all border border-slate-800/80 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 animate-slide-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                        {jd.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          {jd.department}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          {jd._count?.candidates || 0} applicants
                        </span>
                        {jd.openings && (
                          <span className="flex items-center">
                            <Award className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            {jd.openings} openings
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border ${
                        jd.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : jd.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {jd.status}
                    </span>
                  </div>
                  
                  {/* Progress Indicator */}
                  {jd.openings && jd._count?.candidates > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                        <span>Hiring Target Pipeline</span>
                        <span>{Math.round((jd._count.candidates / jd.openings) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((jd._count.candidates / jd.openings) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mb-3 text-slate-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">No Active Job Descriptions</h4>
              <p className="text-xs text-slate-400 mb-5">
                Create a new job description to begin campus recruiting
              </p>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Job Description
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions Card */}
        <div className="animate-fade-in">
          <Card>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Quick Actions</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/jobs/create')}
                className="w-full group p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-semibold transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 text-left border border-indigo-400/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-sm font-bold mb-0.5">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>Create New JD</span>
                    </div>
                    <p className="text-[11px] text-indigo-100/80">
                      Define hiring criteria & academic cutoffs
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/bulk-upload')}
                className="w-full group p-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold transition-all shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 text-left border border-sky-400/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-sm font-bold mb-0.5">
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Bulk Upload Candidates</span>
                    </div>
                    <p className="text-[11px] text-sky-100/80">
                      Import student CSV database
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/candidates')}
                className="w-full group p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold transition-all shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 text-left border border-purple-400/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-sm font-bold mb-0.5">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Manage Applicants</span>
                    </div>
                    <p className="text-[11px] text-purple-100/80">
                      Filter & move hiring stages
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('/analytics')}
                className="w-full group p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold transition-all border border-slate-800 hover:border-slate-700 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-sm font-bold mb-0.5">
                      <BarChart3 className="h-4 w-4 mr-2 text-indigo-400" />
                      <span>Campus Analytics</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      View college performance & CGPA splits
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {adminData?.jdStats && Array.isArray(adminData.jdStats) && adminData.jdStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <StageChart
            data={adminData.jdStats.slice(0, 5).map((jdItem: any) => {
              const titleStr = jdItem.title || jdItem.jd?.title || 'Untitled Job';
              return {
                stageName: titleStr.length > 20 ? titleStr.substring(0, 20) + '...' : titleStr,
                count: jdItem.candidateCount || jdItem._count?.candidates || 0,
                percentage: (
                  ((jdItem.candidateCount || jdItem._count?.candidates || 0) /
                    (adminData?.overview?.totalCandidates || 1)) *
                  100
                ).toFixed(1),
              };
            })}
          />
          
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Drive Progress Breakdown</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {adminData.jdStats.slice(0, 5).map((jdItem: any, index: number) => {
                const titleStr = jdItem.title || jdItem.jd?.title || 'Untitled Job';
                const countVal = jdItem.candidateCount || jdItem._count?.candidates || 0;
                const openingsVal = jdItem.openings || jdItem.jd?.openings || 1;
                const pct = Math.round((countVal / openingsVal) * 100);

                return (
                  <div 
                    key={jdItem.id || index} 
                    className="cursor-pointer hover:bg-slate-800/40 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-800"
                    onClick={() => navigate(`/jobs/${jdItem.id || jdItem.jdId}`)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-200 font-bold truncate max-w-[200px]">
                        {titleStr}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-400">
                          {countVal}/{openingsVal}
                        </span>
                        <span className="text-xs font-extrabold text-indigo-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};
