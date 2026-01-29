'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    if (authApi.isAuthenticated()) {
      // Redirect to dashboard (when implemented)
      router.push('/dashboard');
    } else {
      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Noesis</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </main>
  );
}
