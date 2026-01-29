'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  classesApi,
  Class,
  ClassStatus,
  getClassStatusLabel,
  getClassStatusColor,
  getClassTypeLabel,
  formatSchedule,
} from '@/lib/api';
import { authApi } from '@/lib/api';
import { User, Role } from '@/lib/api/types';
import { Sidebar, Header } from '@/components/dashboard';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';

export default function ClassesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadClasses();
    }
  }, [currentUser]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery, statusFilter]);

  const checkAuth = async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      // Check if user has admin or teacher role
      if (
        user.role !== Role.SUPER_ADMIN &&
        user.role !== Role.BRANCH_ADMIN &&
        user.role !== Role.TEACHER
      ) {
        router.push('/dashboard');
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesApi.getAll();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(query) ||
          cls.classCode.toLowerCase().includes(query) ||
          (cls.course?.name && cls.course.name.toLowerCase().includes(query)) ||
          (cls.teacher?.user.name && cls.teacher.user.name.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((cls) => cls.status === statusFilter);
    }

    setFilteredClasses(filtered);
  };

  const handleDelete = async (classId: number, className: string) => {
    if (!confirm(`Are you sure you want to delete ${className}?`)) return;

    try {
      await classesApi.delete(classId);
      await loadClasses();
    } catch (error: any) {
      console.error('Failed to delete class:', error);
      alert(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openClasses = classes.filter(
    (c) => c.status === ClassStatus.OPEN_FOR_ENROLLMENT
  ).length;
  const inProgressClasses = classes.filter(
    (c) => c.status === ClassStatus.IN_PROGRESS
  ).length;
  const fullClasses = classes.filter((c) => c.status === ClassStatus.FULL).length;
  const totalEnrollments = classes.reduce((sum, c) => sum + c.currentEnrollment, 0);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userName={currentUser.name}
        userRole={currentUser.role.replace('_', ' ')}
        userInitials={getInitials(currentUser.name)}
      />

      <div className="flex-1 flex flex-col">
        <Header onLogout={handleLogout} title="Class Management" />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Calendar className="text-blue-600" size={32} />
                Class Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your classes, schedules, and enrollments
              </p>
            </div>
            {(currentUser.role === Role.SUPER_ADMIN ||
              currentUser.role === Role.BRANCH_ADMIN) && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-200"
              >
                <Plus size={20} className="mr-2" />
                Add Class
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, code, course, or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Status</option>
                  {Object.values(ClassStatus).map((status) => (
                    <option key={status} value={status}>
                      {getClassStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Classes</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {classes.length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Open for Enrollment</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{openClasses}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">In Progress</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {inProgressClasses}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Enrollments</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {totalEnrollments}
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Loading classes...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Calendar}
                  title={searchQuery || statusFilter ? 'No classes found' : 'No classes yet'}
                  description={
                    searchQuery || statusFilter
                      ? 'Try adjusting your search or filters'
                      : 'Create your first class to start managing your schedule'
                  }
                  actionLabel={
                    searchQuery || statusFilter || currentUser.role === Role.TEACHER
                      ? undefined
                      : 'Create Class'
                  }
                  onAction={
                    searchQuery || statusFilter || currentUser.role === Role.TEACHER
                      ? undefined
                      : () => setShowCreateModal(true)
                  }
                />
              </div>
            ) : (
              filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                      <p className="text-sm text-slate-600 font-mono mt-1">{cls.classCode}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getClassStatusColor(
                        cls.status
                      )}`}
                    >
                      {getClassStatusLabel(cls.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {cls.course && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen size={16} className="flex-shrink-0" />
                        <span>{cls.course.name}</span>
                      </div>
                    )}
                    {cls.teacher && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <GraduationCap size={16} className="flex-shrink-0" />
                        <span>{cls.teacher.user.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="flex-shrink-0" />
                      <span className="truncate">{formatSchedule(cls.schedule)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} className="flex-shrink-0" />
                      <span>
                        {cls.currentEnrollment}/{cls.maxCapacity} students
                      </span>
                    </div>
                    {cls.room && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span>{cls.room.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                      {getClassTypeLabel(cls.classType)}
                    </span>
                    {cls.termName && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                        {cls.termName}
                      </span>
                    )}
                  </div>

                  {(currentUser.role === Role.SUPER_ADMIN ||
                    currentUser.role === Role.BRANCH_ADMIN) && (
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setEditingClass(cls)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id, cls.name)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Modal - TODO: Implement ClassModal component */}
      {(showCreateModal || editingClass) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {editingClass ? 'Edit Class' : 'Create Class'}
            </h2>
            <p className="text-slate-600 mb-6">
              Class modal component will be implemented in the next step
            </p>
            <Button
              onClick={() => {
                setShowCreateModal(false);
                setEditingClass(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
