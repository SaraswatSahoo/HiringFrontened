import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { jdAPI } from '../../api/jd';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Step definitions
const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Job title and description' },
  { id: 2, name: 'Requirements', description: 'Skills and qualifications' },
  { id: 3, name: 'Eligibility', description: 'Academic criteria' },
  { id: 4, name: 'Compensation', description: 'Salary and openings' },
];

export const CreateJDPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingJD, setFetchingJD] = useState(isEditMode);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Basic Info (Step 1)
    title: '',
    description: '',
    department: '',
    location: '',
    
    // Requirements (Step 2)
    responsibilities: '',
    skills: [] as string[],
    employmentType: 'Full-time',
    experienceLevel: 'Fresher',
    workMode: 'Onsite',
    
    // Eligibility (Step 3)
    eligibleDegrees: ['B.Tech', 'B.E', 'MCA'] as string[],
    eligibleStreams: ['Computer Science', 'IT'] as string[],
    eligibleYears: [2024, 2025, 2026] as number[],
    minCGPA: '',
    
    // Compensation (Step 4)
    salaryMin: '',
    salaryMax: '',
    openings: '',
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
        responsibilities: jd.responsibilities || '',
        skills: jd.skills || [],
        employmentType: jd.employmentType || 'Full-time',
        experienceLevel: jd.experienceLevel || 'Fresher',
        workMode: jd.workMode || 'Onsite',
        eligibleDegrees: jd.eligibleDegrees || [],
        eligibleStreams: jd.eligibleStreams || [],
        eligibleYears: jd.eligibleYears || [],
        minCGPA: jd.minCGPA?.toString() || '',
        salaryMin: jd.salaryMin?.toString() || '',
        salaryMax: jd.salaryMax?.toString() || '',
        openings: jd.openings?.toString() || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch JD details');
    } finally {
      setFetchingJD(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        location: formData.location || undefined,
        responsibilities: formData.responsibilities || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        employmentType: formData.employmentType || undefined,
        experienceLevel: formData.experienceLevel || undefined,
        workMode: formData.workMode || undefined,
        eligibleDegrees: formData.eligibleDegrees.length > 0 ? formData.eligibleDegrees : undefined,
        eligibleStreams: formData.eligibleStreams.length > 0 ? formData.eligibleStreams : undefined,
        eligibleYears: formData.eligibleYears.length > 0 ? formData.eligibleYears : undefined,
        minCGPA: formData.minCGPA ? Number(formData.minCGPA) : undefined,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        openings: formData.openings ? Number(formData.openings) : undefined,
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (!validateStep(currentStep)) {
      return;
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('Job title is required');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Job description is required');
          return false;
        }
        if (!formData.department.trim()) {
          setError('Department is required');
          return false;
        }
        break;
      case 2:
        // Optional validations
        break;
      case 3:
        if (formData.eligibleDegrees.length === 0) {
          setError('At least one eligible degree is required');
          return false;
        }
        if (formData.eligibleYears.length === 0) {
          setError('At least one eligible year is required');
          return false;
        }
        break;
      case 4:
        if (formData.salaryMin && formData.salaryMax) {
          if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
            setError('Minimum salary cannot be greater than maximum salary');
            return false;
          }
        }
        break;
    }
    return true;
  };

  const addToArray = (field: 'eligibleDegrees' | 'eligibleStreams' | 'skills', value: string) => {
    if (value && value.trim() && !formData[field].includes(value.trim())) {
      setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    }
  };

  const removeFromArray = (field: 'eligibleDegrees' | 'eligibleStreams' | 'skills' | 'eligibleYears', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
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
            eligibleYears: [...formData.eligibleYears, year].sort((a, b) => a - b),
          });
        }
      } else {
        toast.error('Please enter a valid year between 2020 and 2030');
      }
    }
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.id
                        ? 'bg-purple-600 border-purple-600'
                        : currentStep === step.id
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all ${
                      currentStep > step.id ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start space-x-3 animate-slide-in-up">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <BasicInfoStep formData={formData} setFormData={setFormData} />
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && (
              <RequirementsStep
                formData={formData}
                setFormData={setFormData}
                addToArray={addToArray}
                removeFromArray={removeFromArray}
              />
            )}

            {/* Step 3: Eligibility */}
            {currentStep === 3 && (
              <EligibilityStep
                formData={formData}
                setFormData={setFormData}
                addToArray={addToArray}
                removeFromArray={removeFromArray}
                addYear={addYear}
              />
            )}

            {/* Step 4: Compensation */}
            {currentStep === 4 && (
              <CompensationStep formData={formData} setFormData={setFormData} />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-700 mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-3">
                <Button type="button" variant="ghost" onClick={() => navigate('/jobs')}>
                  Cancel
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext} loading={loading}>
                    {isEditMode ? 'Update Job Description' : 'Create Job Description'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

// Step Components
const BasicInfoStep: React.FC<any> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Job Title *
      </label>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        rows={6}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        placeholder="Describe the role, responsibilities, and key requirements..."
        required
      />
      <p className="text-xs text-slate-500 mt-1">
        Provide a detailed overview of the position and what the role entails
      </p>
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
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., Bangalore, Pune, Remote"
        />
      </div>
    </div>
  </div>
);

const RequirementsStep: React.FC<any> = ({ formData, setFormData, addToArray, removeFromArray }) => {
  const [skillInput, setSkillInput] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Requirements & Skills</h3>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Responsibilities
        </label>
        <textarea
          value={formData.responsibilities}
          onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          placeholder="List key responsibilities and day-to-day tasks..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Required Skills
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeFromArray('skills', index)}
                className="ml-2 hover:text-blue-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('skills', skillInput);
                setSkillInput('');
              }
            }}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Java, Python, React"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              addToArray('skills', skillInput);
              setSkillInput('');
            }}
          >
            Add
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Press Enter or click Add to include a skill
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Employment Type
          </label>
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Experience Level
          </label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Fresher">Fresher</option>
            <option value="0-2 years">0-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Work Mode
          </label>
          <select
            value={formData.workMode}
            onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const EligibilityStep: React.FC<any> = ({ formData, setFormData, addToArray, removeFromArray, addYear }) => {
  const [degreeInput, setDegreeInput] = useState('');
  const [streamInput, setStreamInput] = useState('');

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Eligibility Criteria</h3>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Eligible Degrees *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.eligibleDegrees.map((degree: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30"
            >
              {degree}
              <button
                type="button"
                onClick={() => removeFromArray('eligibleDegrees', index)}
                className="ml-2 hover:text-purple-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={degreeInput}
            onChange={(e) => setDegreeInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('eligibleDegrees', degreeInput);
                setDegreeInput('');
              }
            }}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., B.Tech, MCA"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              addToArray('eligibleDegrees', degreeInput);
              setDegreeInput('');
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Eligible Streams
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.eligibleStreams.map((stream: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/30"
            >
              {stream}
              <button
                type="button"
                onClick={() => removeFromArray('eligibleStreams', index)}
                className="ml-2 hover:text-green-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={streamInput}
            onChange={(e) => setStreamInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('eligibleStreams', streamInput);
                setStreamInput('');
              }
            }}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Computer Science, IT, Electronics"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              addToArray('eligibleStreams', streamInput);
              setStreamInput('');
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Eligible Pass Out Years *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.eligibleYears.map((year: number, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-teal-500/20 text-teal-400 border border-teal-500/30"
            >
              {year}
              <button
                type="button"
                onClick={() => removeFromArray('eligibleYears', index)}
                className="ml-2 hover:text-teal-300"
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
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., 7.0"
        />
        <p className="text-xs text-slate-500 mt-1">
          Candidates below this CGPA will be marked as ineligible
        </p>
      </div>
    </div>
  );
};

const CompensationStep: React.FC<any> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-4">Compensation & Openings</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Minimum Salary (₹/year)
        </label>
        <input
          type="number"
          value={formData.salaryMin}
          onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., 600000"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Maximum Salary (₹/year)
        </label>
        <input
          type="number"
          value={formData.salaryMax}
          onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., 1200000"
          min="0"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Number of Openings
      </label>
      <input
        type="number"
        value={formData.openings}
        onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="e.g., 50"
        min="1"
      />
      <p className="text-xs text-slate-500 mt-1">
        How many candidates are you looking to hire for this position?
      </p>
    </div>

    {/* Summary */}
    <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 mt-8">
      <h4 className="text-lg font-semibold text-white mb-4">Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Position:</span>
          <span className="text-white font-medium">{formData.title || 'Not specified'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Department:</span>
          <span className="text-white font-medium">{formData.department || 'Not specified'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Openings:</span>
          <span className="text-white font-medium">{formData.openings || 'Not specified'}</span>
        </div>
        {formData.salaryMin && formData.salaryMax && (
          <div className="flex justify-between">
            <span className="text-slate-400">Salary Range:</span>
            <span className="text-white font-medium">
              ₹{Number(formData.salaryMin).toLocaleString()} - ₹{Number(formData.salaryMax).toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Eligible Degrees:</span>
          <span className="text-white font-medium">{formData.eligibleDegrees.length} selected</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Eligible Years:</span>
          <span className="text-white font-medium">{formData.eligibleYears.length} selected</span>
        </div>
      </div>
    </div>
  </div>
);
