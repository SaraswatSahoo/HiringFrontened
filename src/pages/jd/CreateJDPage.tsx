import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { jdAPI } from '../../api/jd';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const CreateJDPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // For edit mode
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingJD, setFetchingJD] = useState(isEditMode);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    openings: '',
    eligibleDegrees: ['B.Tech', 'B.E', 'MCA'],
    eligibleYears: [2024, 2025, 2026],
    minCGPA: '',
  });

  // Fetch JD details if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchJDDetails();
    }
  }, [id, isEditMode]);

  const fetchJDDetails = async () => {
    try {
      setFetchingJD(true);
      const { jd } = await jdAPI.getById(id!);
      setFormData({
        title: jd.title,
        description: jd.description,
        department: jd.department,
        location: jd.location || '',
        salaryMin: jd.salaryMin?.toString() || '',
        salaryMax: jd.salaryMax?.toString() || '',
        openings: jd.openings?.toString() || '',
        eligibleDegrees: jd.eligibleDegrees,
        eligibleYears: jd.eligibleYears,
        minCGPA: jd.minCGPA?.toString() || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch JD details');
    } finally {
      setFetchingJD(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        openings: formData.openings ? Number(formData.openings) : undefined,
        minCGPA: formData.minCGPA ? Number(formData.minCGPA) : undefined,
      };

      if (isEditMode) {
        const { jd } = await jdAPI.update(id!, payload);
        navigate(`/jobs/${jd.id}`);
      } else {
        const { jd } = await jdAPI.create(payload);
        navigate(`/jobs/${jd.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} JD`);
    } finally {
      setLoading(false);
    }
  };

  const addDegree = () => {
    const degree = prompt('Enter degree (e.g., B.Tech, M.Tech):');
    if (degree && degree.trim()) {
      const trimmedDegree = degree.trim();
      if (!formData.eligibleDegrees.includes(trimmedDegree)) {
        setFormData({ ...formData, eligibleDegrees: [...formData.eligibleDegrees, trimmedDegree] });
      }
    }
  };

  const removeDegree = (index: number) => {
    setFormData({
      ...formData,
      eligibleDegrees: formData.eligibleDegrees.filter((_, i) => i !== index),
    });
  };

  const addYear = () => {
    const yearStr = prompt('Enter pass out year (e.g., 2024, 2025):');
    if (yearStr) {
      const year = Number(yearStr);
      if (!isNaN(year) && year >= 2020 && year <= 2030) {
        if (!formData.eligibleYears.includes(year)) {
          setFormData({ 
            ...formData, 
            eligibleYears: [...formData.eligibleYears, year].sort((a, b) => a - b) 
          });
        }
      } else {
        alert('Please enter a valid year between 2020 and 2030');
      }
    }
  };

  const removeYear = (index: number) => {
    setFormData({
      ...formData,
      eligibleYears: formData.eligibleYears.filter((_, i) => i !== index),
    });
  };

  if (fetchingJD) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={isEditMode ? 'Edit Job Description' : 'Create Job Description'} 
      subtitle={isEditMode ? 'Update hiring requirements' : 'Define your hiring requirements'}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start space-x-3 animate-slide-in-up">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="e.g., Software Engineer - Campus Hiring 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder="Describe the role, responsibilities, and key requirements..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., Engineering, IT, Product"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., Bangalore, Pune, Remote"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Salary (₹/year)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., 600000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Salary (₹/year)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., 1200000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Openings
                  </label>
                  <input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g., 50"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-4 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white">Eligibility Criteria</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Eligible Degrees *
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.eligibleDegrees.map((degree, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-fade-in"
                    >
                      {degree}
                      <button
                        type="button"
                        onClick={() => removeDegree(index)}
                        className="ml-2 hover:text-purple-300 transition-colors"
                        aria-label={`Remove ${degree}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={addDegree}>
                  + Add Degree
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Eligible Pass Out Years *
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.eligibleYears.map((year, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-fade-in"
                    >
                      {year}
                      <button
                        type="button"
                        onClick={() => removeYear(index)}
                        className="ml-2 hover:text-teal-300 transition-colors"
                        aria-label={`Remove ${year}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={addYear}>
                  + Add Year
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.minCGPA}
                  onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="e.g., 7.0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Candidates below this CGPA will be marked as ineligible
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
              <Button type="button" variant="ghost" onClick={() => navigate('/jobs')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {isEditMode ? 'Update Job Description' : 'Create Job Description'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
