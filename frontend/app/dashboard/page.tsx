'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get user info
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
  }, [router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Noesis</h1>
            <p className="text-sm text-muted-foreground">Tuition Centre Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">
            You are logged in as {user.role}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage teachers, students, and staff</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>View and manage leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload and manage documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Development Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 System Status</CardTitle>
            <CardDescription>Current Implementation Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">✅ <strong>Backend API:</strong> Running on port 3001</p>
              <p className="text-sm">✅ <strong>Authentication:</strong> Login & Registration working</p>
              <p className="text-sm">✅ <strong>Database:</strong> PostgreSQL connected</p>
              <p className="text-sm">✅ <strong>Leave Management API:</strong> 9 endpoints available</p>
              <p className="text-sm">⏳ <strong>Dashboard Pages:</strong> Under development</p>
              <p className="text-sm">⏳ <strong>User Management UI:</strong> Coming soon</p>
              <p className="text-sm">⏳ <strong>Leave Management UI:</strong> Coming soon</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
