'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';
import { authApi } from '@/lib/api';
import { User, Role } from '@/lib/api/types';
import { Sidebar, Header } from '@/components/dashboard';
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { EmptyState } from '@/components/common/EmptyState';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { markUserCreated } = useOnboarding();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      setActionLoading(userId);
      await usersApi.deactivateUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert('Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (userId: number) => {
    try {
      setActionLoading(userId);
      await usersApi.reactivateUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to reactivate user:', error);
      alert('Failed to reactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: number, userEmail: string) => {
    if (!confirm(`Reset password for ${userEmail}?`)) return;

    try {
      setActionLoading(userId);
      const result = await usersApi.resetPassword(userId);
      alert(`Password reset successfully!\n\nTemporary Password: ${result.temporaryPassword}\n\nPlease share this with the user securely.`);
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case Role.BRANCH_ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Role.TEACHER:
        return 'bg-green-100 text-green-800 border-green-200';
      case Role.STUDENT:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Role.PARENT:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: Role) => {
    return role.replace('_', ' ');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        <Header onLogout={handleLogout} title="User Management" />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <UsersIcon className="text-blue-600" size={32} />
                User Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage users, roles, and permissions
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-200"
            >
              <UserPlus size={20} className="mr-2" />
              Add User
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <Label htmlFor="roleFilter" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Role
                </Label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">All Roles</option>
                  <option value={Role.SUPER_ADMIN}>Super Admin</option>
                  <option value={Role.BRANCH_ADMIN}>Branch Admin</option>
                  <option value={Role.TEACHER}>Teacher</option>
                  <option value={Role.STUDENT}>Student</option>
                  <option value={Role.PARENT}>Parent</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="statusFilter" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Status
                </Label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Users</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Active Users</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {users.filter((u) => u.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Teachers</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {users.filter((u) => u.role === Role.TEACHER).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Students</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {users.filter((u) => u.role === Role.STUDENT).length}
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-slate-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No users yet"
              description="Create your first user to start managing teachers, students, and admins"
              actionLabel="Add User"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-600">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">{user.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <UserCheck size={14} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                <UserX size={14} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResetPassword(user.id, user.email)}
                                disabled={actionLoading === user.id}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reset Password"
                              >
                                <KeyRound size={18} />
                              </button>
                              {user.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Deactivate User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivate(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reactivate User"
                                >
                                  <RotateCcw size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadUsers();
            // Mark onboarding step as complete when creating a user
            markUserCreated();
          }}
        />
      )}
    </div>
  );
}
