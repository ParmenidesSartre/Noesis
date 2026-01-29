'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { branchesApi, Branch } from '@/lib/api';
import { authApi } from '@/lib/api';
import { User, Role } from '@/lib/api/types';
import { Sidebar, Header } from '@/components/dashboard';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BranchModal } from '@/components/branches/BranchModal';
import { EmptyState } from '@/components/common/EmptyState';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

export default function BranchesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { markBranchCreated } = useOnboarding();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadBranches();
    }
  }, [currentUser]);

  useEffect(() => {
    filterBranches();
  }, [branches, searchQuery]);

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

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await branchesApi.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBranches = () => {
    let filtered = [...branches];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (branch) =>
          branch.name.toLowerCase().includes(query) ||
          branch.code.toLowerCase().includes(query) ||
          (branch.address && branch.address.toLowerCase().includes(query))
      );
    }

    setFilteredBranches(filtered);
  };

  const handleDelete = async (branchId: number, branchName: string) => {
    if (!confirm(`Are you sure you want to delete ${branchName}?`)) return;

    try {
      await branchesApi.delete(branchId);
      await loadBranches();
    } catch (error) {
      console.error('Failed to delete branch:', error);
      alert('Failed to delete branch');
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
        <Header onLogout={handleLogout} title="Branch Management" />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Building2 className="text-blue-600" size={32} />
                Branch Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your organization's branches and locations
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-200"
            >
              <Plus size={20} className="mr-2" />
              Add Branch
            </Button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, code, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Total Branches</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{branches.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Active Branches</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {branches.filter((b) => b.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 font-medium">Inactive Branches</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {branches.filter((b) => !b.isActive).length}
              </div>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Loading branches...</p>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Building2}
                  title={searchQuery ? 'No branches found' : 'No branches yet'}
                  description={
                    searchQuery
                      ? 'Try adjusting your search query'
                      : 'Create your first branch to organize your tuition center locations'
                  }
                  actionLabel={searchQuery ? undefined : 'Create Branch'}
                  onAction={searchQuery ? undefined : () => setShowCreateModal(true)}
                />
              </div>
            ) : (
              filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                      <p className="text-sm text-slate-600 font-mono mt-1">{branch.code}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        branch.isActive
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {branch.address && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={16} className="flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={16} className="flex-shrink-0" />
                        <span>{branch.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setEditingBranch(branch)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id, branch.name)}
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
      {(showCreateModal || editingBranch) && (
        <BranchModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingBranch(null);
          }}
          onSuccess={() => {
            loadBranches();
            if (!editingBranch) {
              // Mark onboarding step as complete when creating a new branch
              markBranchCreated();
            }
          }}
          branch={editingBranch}
        />
      )}
    </div>
  );
}
