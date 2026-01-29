'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  coursesApi,
  Course,
  CourseCategory,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  getSessionDurationLabel,
} from '@/lib/api';
import { authApi } from '@/lib/api';
import { User, Role } from '@/lib/api/types';
import { Sidebar, Header } from '@/components/dashboard';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseModal } from '@/components/courses/CourseModal';
import { EmptyState } from '@/components/common/EmptyState';

export default function CoursesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, categoryFilter, statusFilter]);

  const checkAuth = async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      // Check if user has admin role
      if (user.role !== Role.SUPER_ADMIN && user.role !== Role.BRANCH_ADMIN) {
        router.push('/dashboard');
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((course) => course.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((course) => course.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((course) => !course.isActive);
    }

    setFilteredCourses(filtered);
  };

  const handleDelete = async (courseId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to delete ${courseName}?`)) return;

    try {
      await coursesApi.delete(courseId);
      await loadCourses();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
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

  const activeCourses = courses.filter((c) => c.isActive).length;
  const totalClasses = courses.reduce((sum, c) => sum + (c._count?.classes || 0), 0);
  const spamCourses = courses.filter((c) => c.category === CourseCategory.SPM).length;

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
        <Header onLogout={handleLogout} title="Course Management" />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BookOpen className="text-blue-600" size={32} />
                Course Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your organization's course catalog
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-200"
            >
              <Plus size={20} className="mr-2" />
              Add Course
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Categories</option>
                  {Object.values(CourseCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {getCourseCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Courses</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Active Courses</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{activeCourses}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">SPM Courses</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{spamCourses}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Classes</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{totalClasses}</div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={BookOpen}
                  title={searchQuery || categoryFilter || statusFilter ? 'No courses found' : 'No courses yet'}
                  description={
                    searchQuery || categoryFilter || statusFilter
                      ? 'Try adjusting your search or filters'
                      : 'Create your first course to start building your course catalog'
                  }
                  actionLabel={searchQuery || categoryFilter || statusFilter ? undefined : 'Create Course'}
                  onAction={searchQuery || categoryFilter || statusFilter ? undefined : () => setShowCreateModal(true)}
                />
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                      <p className="text-sm text-slate-600 font-mono mt-1">{course.code}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.isActive
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <GraduationCap size={16} className="flex-shrink-0" />
                      <span>{getCourseCategoryLabel(course.category)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="flex-shrink-0" />
                      <span>{getSessionDurationLabel(course.sessionDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} className="flex-shrink-0" />
                      <span>
                        {course.minClassSize}-{course.maxClassSize} students
                      </span>
                    </div>
                    {course.baseFeePerMonth && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp size={16} className="flex-shrink-0" />
                        <span className="font-semibold text-blue-600">
                          RM {course.baseFeePerMonth.toFixed(2)}/month
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.gradeLevels.slice(0, 3).map((level: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                      >
                        {getCourseLevelLabel(level)}
                      </span>
                    ))}
                    {course.gradeLevels.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                        +{course.gradeLevels.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <CourseModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingCourse(null);
          }}
          onSuccess={() => {
            loadCourses();
          }}
          course={editingCourse}
        />
      )}
    </div>
  );
}
