'use client';

import { useState, useEffect } from 'react';
import {
  coursesApi,
  Course,
  CourseCategory,
  CourseLevel,
  DifficultyLevel,
  SessionDuration,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  getSessionDurationLabel,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, BookOpen, AlertCircle } from 'lucide-react';

interface CourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  course?: Course | null;
}

export function CourseModal({ onClose, onSuccess, course }: CourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    objectives: course?.objectives || '',
    category: course?.category || CourseCategory.SPM,
    difficultyLevel: course?.difficultyLevel || DifficultyLevel.BEGINNER,
    gradeLevels: course?.gradeLevels || [],
    minAge: course?.minAge || undefined,
    maxAge: course?.maxAge || undefined,
    prerequisites: course?.prerequisites || '',
    sessionDuration: course?.sessionDuration || SessionDuration.SIXTY_MIN,
    totalWeeks: course?.totalWeeks || undefined,
    isOngoing: course?.isOngoing ?? true,
    maxClassSize: course?.maxClassSize || 30,
    minClassSize: course?.minClassSize || 5,
    baseFeePerSession: course?.baseFeePerSession || undefined,
    baseFeePerMonth: course?.baseFeePerMonth || undefined,
    baseFeePerTerm: course?.baseFeePerTerm || undefined,
    materialFee: course?.materialFee || undefined,
    registrationFee: course?.registrationFee || undefined,
    trialSessionFee: course?.trialSessionFee || undefined,
    additionalMaterials: course?.additionalMaterials || '',
    digitalResources: course?.digitalResources || '',
    isActive: course?.isActive ?? true,
    enrollmentOpen: course?.enrollmentOpen ?? true,
    waitlistEnabled: course?.waitlistEnabled ?? false,
    publicVisibility: course?.publicVisibility ?? true,
    isTemplate: course?.isTemplate ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert empty strings to undefined for optional numeric fields
      const submitData = {
        ...formData,
        minAge: formData.minAge || undefined,
        maxAge: formData.maxAge || undefined,
        totalWeeks: formData.totalWeeks || undefined,
        baseFeePerSession: formData.baseFeePerSession || undefined,
        baseFeePerMonth: formData.baseFeePerMonth || undefined,
        baseFeePerTerm: formData.baseFeePerTerm || undefined,
        materialFee: formData.materialFee || undefined,
        registrationFee: formData.registrationFee || undefined,
        trialSessionFee: formData.trialSessionFee || undefined,
      };

      if (course) {
        await coursesApi.update(course.id, submitData);
      } else {
        await coursesApi.create(submitData as any);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const toggleGradeLevel = (level: CourseLevel) => {
    const current = formData.gradeLevels as CourseLevel[];
    if (current.includes(level)) {
      setFormData({
        ...formData,
        gradeLevels: current.filter((l) => l !== level),
      });
    } else {
      setFormData({
        ...formData,
        gradeLevels: [...current, level],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {course ? 'Edit Course' : 'Add New Course'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {course ? 'Update course information' : 'Create a new course for your organization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Course Name <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Matematik SPM"
                  />
                </div>
                <div>
                  <Label htmlFor="code" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Course Code <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    placeholder="MATH-SPM-001"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Comprehensive mathematics course for SPM students"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="objectives" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Learning Objectives
                </Label>
                <textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="List the key learning objectives"
                  rows={3}
                />
              </div>
            </div>

            {/* Course Details */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Course Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CourseCategory })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Object.values(CourseCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {getCourseCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficultyLevel" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Difficulty Level <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="difficultyLevel"
                    required
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as DifficultyLevel })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={DifficultyLevel.BEGINNER}>Beginner</option>
                    <option value={DifficultyLevel.INTERMEDIATE}>Intermediate</option>
                    <option value={DifficultyLevel.ADVANCED}>Advanced</option>
                    <option value={DifficultyLevel.MIXED}>Mixed</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sessionDuration" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Session Duration <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="sessionDuration"
                    required
                    value={formData.sessionDuration}
                    onChange={(e) => setFormData({ ...formData, sessionDuration: e.target.value as SessionDuration })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Object.values(SessionDuration).map((duration) => (
                      <option key={duration} value={duration}>
                        {getSessionDurationLabel(duration)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="totalWeeks" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Total Weeks
                  </Label>
                  <input
                    id="totalWeeks"
                    type="number"
                    min="1"
                    value={formData.totalWeeks || ''}
                    onChange={(e) => setFormData({ ...formData, totalWeeks: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Leave empty for ongoing"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Grade Levels <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(CourseLevel).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => toggleGradeLevel(level)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (formData.gradeLevels as CourseLevel[]).includes(level)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {getCourseLevelLabel(level)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Class Size & Pricing */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Class Size & Pricing (RM)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minClassSize" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Min Class Size <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="minClassSize"
                    type="number"
                    required
                    min="1"
                    value={formData.minClassSize}
                    onChange={(e) => setFormData({ ...formData, minClassSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <Label htmlFor="maxClassSize" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Max Class Size <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="maxClassSize"
                    type="number"
                    required
                    min="1"
                    value={formData.maxClassSize}
                    onChange={(e) => setFormData({ ...formData, maxClassSize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <Label htmlFor="baseFeePerMonth" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Base Fee Per Month (RM)
                  </Label>
                  <input
                    id="baseFeePerMonth"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseFeePerMonth || ''}
                    onChange={(e) => setFormData({ ...formData, baseFeePerMonth: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="200.00"
                  />
                </div>
                <div>
                  <Label htmlFor="materialFee" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Material Fee (RM)
                  </Label>
                  <input
                    id="materialFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.materialFee || ''}
                    onChange={(e) => setFormData({ ...formData, materialFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationFee" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Registration Fee (RM)
                  </Label>
                  <input
                    id="registrationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.registrationFee || ''}
                    onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <Label htmlFor="trialSessionFee" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Trial Session Fee (RM)
                  </Label>
                  <input
                    id="trialSessionFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.trialSessionFee || ''}
                    onChange={(e) => setFormData({ ...formData, trialSessionFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="30.00"
                  />
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Status Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.enrollmentOpen}
                    onChange={(e) => setFormData({ ...formData, enrollmentOpen: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Enrollment Open</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.waitlistEnabled}
                    onChange={(e) => setFormData({ ...formData, waitlistEnabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Waitlist Enabled</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.publicVisibility}
                    onChange={(e) => setFormData({ ...formData, publicVisibility: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Public Visibility</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6 sticky bottom-0 bg-white pb-2">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (formData.gradeLevels as CourseLevel[]).length === 0}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {course ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BookOpen size={18} />
                    {course ? 'Update Course' : 'Create Course'}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
