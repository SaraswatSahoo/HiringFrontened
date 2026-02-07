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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [recentJDs, setRecentJDs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);

      const [adminDash, jds] = await Promise.all([
        dashboardAPI.getAdminDashboard(),
        jdAPI.getAll({ limit: 5, status: 'ACTIVE' }),
      ]);
      setAdminData(adminDash);
      setRecentJDs(jds.jds);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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

  const stats = [
    {
      label: 'Total JDs',
      value: adminData?.overview?.totalJDs || 0,
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
      subtitle: `${adminData?.overview?.activeJDs || 0} active`,
    },
    {
      label: 'Active JDs',
      value: adminData?.overview?.activeJDs || 0,
      icon: TrendingUp,
      color: 'from-teal-500 to-blue-500',
      subtitle: 'Currently hiring',
    },
    {
      label: 'Total Candidates',
      value: adminData?.overview?.totalCandidates || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      subtitle: `${adminData?.overview?.eligibleCandidates || 0} eligible`,
    },
    {
      label: 'Total Selections',
      value: adminData?.overview?.totalSelections || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      subtitle: 'Successfully hired',
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
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'User'}!`}
      subtitle="Here's your hiring overview"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden animate-slide-in-up"
            hover
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-linear-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-400">{stat.label}</p>
              {stat.subtitle && (
                <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Job Descriptions */}
        <Card className="lg:col-span-2 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Active Job Descriptions</h3>
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {recentJDs.length > 0 ? (
            <div className="space-y-3">
              {recentJDs.map((jd, index) => (
                <div
                  key={jd.id}
                  onClick={() => navigate(`/jobs/${jd.id}`)}
                  className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all border border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 animate-slide-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1 hover:text-purple-400 transition-colors">
                        {jd.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1" />
                          {jd.department}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {jd._count?.candidates || 0} candidates
                        </span>
                        {jd.openings && (
                          <span className="flex items-center">
                            <Award className="h-3.5 w-3.5 mr-1" />
                            {jd.openings} openings
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        jd.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : jd.status === 'PAUSED'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {jd.status}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  {jd.openings && jd._count?.candidates > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Hiring Progress</span>
                        <span>{Math.round((jd._count.candidates / jd.openings) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-linear-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
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
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                <Briefcase className="h-8 w-8 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No Active Job Descriptions</h4>
              <p className="text-sm text-slate-400 mb-6">
                Get started by creating your first job description
              </p>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Description
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/jobs/create')}
                className="w-full group p-4 rounded-lg bg-linear-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span>Create New JD</span>
                    </div>
                    <p className="text-xs text-purple-100 opacity-90">
                      Define hiring requirements
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              <button
                onClick={() => navigate('/bulk-upload')}
                className="w-full group p-4 rounded-lg bg-linear-to-br from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-teal-500/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <Upload className="h-5 w-5 mr-2" />
                      <span>Bulk Upload</span>
                    </div>
                    <p className="text-xs text-teal-100 opacity-90">
                      Import candidates via CSV
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              <button
                onClick={() => navigate('/candidates')}
                className="w-full group p-4 rounded-lg bg-linear-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <Users className="h-5 w-5 mr-2" />
                      <span>View Candidates</span>
                    </div>
                    <p className="text-xs text-blue-100 opacity-90">
                      Manage applicants
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              <button
                onClick={() => navigate('/jobs')}
                className="w-full group p-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-slate-700 hover:border-slate-600 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      <span>View Analytics</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Track performance metrics
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      {adminData?.jdStats && adminData.jdStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <StageChart
            data={adminData.jdStats.slice(0, 5).map((jd: any) => ({
              stageName: jd.title.length > 20 ? jd.title.substring(0, 20) + '...' : jd.title,
              count: jd.candidateCount,
              percentage: ((jd.candidateCount / (adminData?.overview?.totalCandidates || 1)) * 100).toFixed(1),
            }))}
          />
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">JD Performance</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {adminData.jdStats.slice(0, 5).map((jd: any, index: number) => (
                <div 
                  key={index} 
                  className="cursor-pointer hover:bg-slate-800/50 p-3 -mx-3 rounded-lg transition-colors"
                  onClick={() => navigate(`/jobs/${jd.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-medium truncate max-w-50">
                      {jd.title}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500">
                        {jd.candidateCount}/{jd.openings || 100}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {Math.round((jd.candidateCount / (jd.openings || 100)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((jd.candidateCount / (jd.openings || 100)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};
