'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiKeyForm } from '@/components/setup/ApiKeyForm';
import { WorkspaceSelector } from '@/components/setup/WorkspaceSelector';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/use-auth';
import { useUIStore } from '@/store/ui-store';
import { QUERY_KEYS } from '@/lib/constants';
import type { Owner } from '@/types';

type SetupStep = 'loading' | 'api-key' | 'workspace';

export default function SetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, hasWorkspace, isLoading } = useAuth();
  const setWorkspace = useUIStore((s) => s.setWorkspace);
  const [step, setStep] = useState<SetupStep>('loading');
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && hasWorkspace) {
      router.replace('/canvas');
    } else {
      setStep('api-key');
    }
  }, [isAuthenticated, hasWorkspace, isLoading, router]);

  const handleApiKeySuccess = (returnedOwners: Owner[]) => {
    if (returnedOwners.length === 1) {
      handleWorkspaceSelect(returnedOwners[0]);
    } else {
      setOwners(returnedOwners);
      setStep('workspace');
    }
  };

  const handleWorkspaceSelect = async (owner: Owner) => {
    setWorkspace(owner.id, owner.name);

    // Update session with selected workspace — wait before navigating
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: owner.id, workspaceName: owner.name }),
    });

    console.log('[Setup] workspace selection response:', res.status, res.ok);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Setup] workspace selection failed:', err);
      return;
    }

    // Verify the session was updated before navigating
    const statusRes = await fetch('/api/auth/status');
    const status = await statusRes.json();
    console.log('[Setup] auth status after workspace selection:', status);

    router.push('/canvas');
  };

  if (step === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-bg">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card-bg p-8 shadow-2xl animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-render-blue flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <circle cx="15" cy="15" r="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Render Canvas</span>
          </div>
        </div>

        {step === 'api-key' && <ApiKeyForm onSuccess={handleApiKeySuccess} />}
        {step === 'workspace' && (
          <WorkspaceSelector owners={owners} onSelect={handleWorkspaceSelect} />
        )}
      </div>
    </div>
  );
}
