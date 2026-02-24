'use client';

import { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Owner } from '@/types';

interface ApiKeyFormProps {
  onSuccess: (owners: Owner[]) => void;
}

export function ApiKeyForm({ onSuccess }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid API key');
      }

      const data = await res.json();
      onSuccess(data.owners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-render-blue/10">
          <KeyRound className="h-7 w-7 text-render-blue" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Connect to Render</h2>
          <p className="mt-1 text-sm text-gray-400">
            Enter your Render API key to get started
          </p>
        </div>
      </div>

      <Input
        type="password"
        label="API Key"
        placeholder="rnd_xxxxxxxxxxxxxxxx"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        error={error}
        helperText="Find your API key at dashboard.render.com → Account Settings → API Keys"
      />

      <Button type="submit" loading={loading} disabled={!apiKey.trim()}>
        Connect
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
