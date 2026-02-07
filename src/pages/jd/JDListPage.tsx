import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { jdAPI } from '../../api/jd';
import type { JobDescription } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPin,
  Users,
  Building2,
  Eye,
  Edit,
  Trash2,
  Filter,
  Briefcase
} from 'lucide-react';

export const JDListPage: React.FC = () => {
  const navigate = useNavigate();
  const [jds, setJDs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJDs();
  }, [page, statusFilter, departmentFilter]);

  const fetchJDs = async () => {
    try {
      setLoading(true);
      const { jds, pagination } = await jdAPI.getAll({
        page,
        limit: 12,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
        search: searchTerm || undefined,
      });
      setJDs(jds);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch JDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchJDs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this JD?')) return;
    try {
      await jdAPI.delete(id);
      fetchJDs();
    } catch (error) {
      console.error('Failed to delete JD:', error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'CLOSED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Layout title="Job Descriptions" subtitle="Manage your hiring requirements">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search job descriptions..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary" size="md">
            Search
          </Button>
        </div>
        <Button onClick={() => navigate('/jobs/create')} size="md">
          <Plus className="h-5 w-5 mr-2" />
          Create JD
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </select>
          <input
            type="text"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            placeholder="Filter by department..."
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {(statusFilter || departmentFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setDepartmentFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* JD Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {jds.map((jd) => (
              <Card key={jd.id} hover className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                    {jd.title}
                  </h3>
                  <Badge variant={getStatusVariant(jd.status)}>{jd.status}</Badge>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{jd.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-300">
                    <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                    {jd.department}
                  </div>
                  {jd.location && (
                    <div className="flex items-center text-sm text-slate-300">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {jd.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-300">
                    <Users className="h-4 w-4 mr-2 text-slate-400" />
                    {jd._count?.candidates || 0} candidates • {jd.openings || 0} openings
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/jobs/${jd.id}`)}
                    className="flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/jobs/${jd.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(jd.id)}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-slate-300">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {jds.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Job Descriptions</h3>
              <p className="text-slate-400 mb-6">Get started by creating your first JD</p>
              <Button onClick={() => navigate('/jobs/create')}>
                <Plus className="h-5 w-5 mr-2" />
                Create JD
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};
