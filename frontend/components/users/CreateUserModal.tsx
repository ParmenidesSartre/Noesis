'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/users';
import { branchesApi, Branch } from '@/lib/api';
import { Role, CreateTeacherRequest, CreateStudentRequest, CreateUserRequest, ParentInfo } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.TEACHER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const data = await branchesApi.getAll();
      setBranches(data.filter(b => b.isActive));
      // Set default branch if available
      if (data.length > 0) {
        setTeacherForm(prev => ({ ...prev, branchId: data[0].id }));
        setStudentForm(prev => ({ ...prev, branchId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setError('Failed to load branches. Please refresh and try again.');
    } finally {
      setLoadingBranches(false);
    }
  };

  // General User Form
  const [generalForm, setGeneralForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    name: '',
    role: Role.TEACHER,
    branchId: undefined,
    phone: '',
    address: '',
  });

  // Teacher Form
  const [teacherForm, setTeacherForm] = useState<CreateTeacherRequest>({
    email: '',
    name: '',
    branchId: 1,
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    employeeId: '',
    employmentStartDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // Student Form
  const [studentForm, setStudentForm] = useState<CreateStudentRequest>({
    email: '',
    name: '',
    branchId: 1,
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    gradeLevel: '',
    schoolName: '',
    address: '',
    medicalInfo: '',
    specialNeeds: '',
    previousTuitionCenter: '',
    referralSource: '',
    parent: {
      email: '',
      name: '',
      phone: '',
      relationship: 'Father',
      address: '',
      occupation: '',
      officePhone: '',
      preferredContactMethod: 'Email',
    },
  });

  // Helper function to remove empty string fields
  const removeEmptyFields = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== '' && value !== null) {
        // For nested objects (like parent in student form)
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          cleaned[key] = removeEmptyFields(value);
        } else {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedRole === Role.TEACHER) {
        const cleanedForm = removeEmptyFields(teacherForm) as CreateTeacherRequest;
        const result = await usersApi.createTeacher(cleanedForm);
        setTemporaryPassword(result.temporaryPassword);
        alert(`Teacher created successfully!\n\nAn email with login credentials has been sent to:\n${result.user.email}\n\nThe teacher will receive their username and temporary password via email.`);
        onSuccess();
      } else if (selectedRole === Role.STUDENT) {
        const cleanedForm = removeEmptyFields(studentForm) as CreateStudentRequest;
        const result = await usersApi.createStudent(cleanedForm);
        let message = 'Student and parent created successfully!\n\n';
        message += `Login credentials have been sent via email to the parent:\n${result.parent.email}\n\n`;
        message += 'The parent will receive login credentials for both the student and parent accounts.';
        alert(message);
        onSuccess();
      } else {
        // General user creation
        const cleanedForm = removeEmptyFields(generalForm) as CreateUserRequest;
        await usersApi.create(cleanedForm);
        alert('User created successfully!');
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
              <p className="text-sm text-slate-600 mt-0.5">Create a new user account</p>
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
        <div className="p-6">
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
            {/* Role Selection */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                User Role
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.TEACHER)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === Role.TEACHER
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">Teacher</div>
                  <div className="text-xs text-slate-600 mt-1">Auto-generated password</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.STUDENT)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === Role.STUDENT
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">Student</div>
                  <div className="text-xs text-slate-600 mt-1">With parent account</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole(Role.BRANCH_ADMIN)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === Role.BRANCH_ADMIN
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">Admin</div>
                  <div className="text-xs text-slate-600 mt-1">Manual password</div>
                </button>
              </div>
            </div>

            {/* Teacher Form */}
            {selectedRole === Role.TEACHER && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-email" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="teacher-email"
                      type="email"
                      required
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="teacher@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="teacher-name"
                      type="text"
                      required
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-phone" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Phone
                    </Label>
                    <input
                      id="teacher-phone"
                      type="tel"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-branch" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Branch <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="teacher-branch"
                      required
                      value={teacherForm.branchId}
                      onChange={(e) => setTeacherForm({ ...teacherForm, branchId: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={loadingBranches}
                    >
                      {loadingBranches ? (
                        <option>Loading branches...</option>
                      ) : branches.length === 0 ? (
                        <option>No branches available</option>
                      ) : (
                        branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-dob" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Date of Birth
                    </Label>
                    <input
                      id="teacher-dob"
                      type="date"
                      value={teacherForm.dateOfBirth}
                      onChange={(e) => setTeacherForm({ ...teacherForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-gender" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Gender
                    </Label>
                    <select
                      id="teacher-gender"
                      value={teacherForm.gender}
                      onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="teacher-address" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Address
                  </Label>
                  <input
                    id="teacher-address"
                    type="text"
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="123 Main St, City, Country"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-emergency-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Emergency Contact Name
                    </Label>
                    <input
                      id="teacher-emergency-name"
                      type="text"
                      value={teacherForm.emergencyContactName}
                      onChange={(e) => setTeacherForm({ ...teacherForm, emergencyContactName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-emergency-phone" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Emergency Contact Phone
                    </Label>
                    <input
                      id="teacher-emergency-phone"
                      type="tel"
                      value={teacherForm.emergencyContactPhone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, emergencyContactPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Student Form */}
            {selectedRole === Role.STUDENT && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Student Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="student-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="student-name"
                          type="text"
                          required
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Student Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-email" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Email (optional)
                        </Label>
                        <input
                          id="student-email"
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="student@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="student-phone" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Phone <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="student-phone"
                          type="tel"
                          required
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-dob" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="student-dob"
                          type="date"
                          required
                          value={studentForm.dateOfBirth}
                          onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-gender" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Gender <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="student-gender"
                          required
                          value={studentForm.gender}
                          onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="student-grade" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Grade Level <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="student-grade"
                          type="text"
                          required
                          value={studentForm.gradeLevel}
                          onChange={(e) => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Grade 10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-school" className="text-sm font-semibold text-slate-700 mb-2 block">
                          School Name <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="student-school"
                          type="text"
                          required
                          value={studentForm.schoolName}
                          onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="ABC High School"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Parent/Guardian Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parent-name" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="parent-name"
                          type="text"
                          required
                          value={studentForm.parent.name}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            parent: { ...studentForm.parent, name: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Parent Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parent-email" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="parent-email"
                          type="email"
                          required
                          value={studentForm.parent.email}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            parent: { ...studentForm.parent, email: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parent-phone" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Phone <span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="parent-phone"
                          type="tel"
                          required
                          value={studentForm.parent.phone}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            parent: { ...studentForm.parent, phone: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parent-relationship" className="text-sm font-semibold text-slate-700 mb-2 block">
                          Relationship <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="parent-relationship"
                          required
                          value={studentForm.parent.relationship}
                          onChange={(e) => setStudentForm({
                            ...studentForm,
                            parent: { ...studentForm.parent, relationship: e.target.value }
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin/Other Form - Coming Soon */}
            {selectedRole !== Role.TEACHER && selectedRole !== Role.STUDENT && (
              <div className="text-center py-8">
                <p className="text-slate-600">
                  Admin user creation coming soon. For now, use the general user API or create teachers/students.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (selectedRole !== Role.TEACHER && selectedRole !== Role.STUDENT)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Create User
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
