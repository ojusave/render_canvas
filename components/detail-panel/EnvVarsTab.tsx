'use client';

import { useState } from 'react';
import { useServiceEnvVars, useUpdateEnvVars } from '@/hooks/use-service-env-vars';
import { useStagedChangesStore } from '@/store/staged-changes-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import type { EnvVar } from '@/types';

interface EnvVarsTabProps {
  serviceId: string;
}

export function EnvVarsTab({ serviceId }: EnvVarsTabProps) {
  const { data: envVars, isLoading } = useServiceEnvVars(serviceId);
  const updateEnvVars = useUpdateEnvVars(serviceId);
  const addChange = useStagedChangesStore((s) => s.addChange);
  const { success, error: showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [editVars, setEditVars] = useState<EnvVar[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Get service name for staged changes
  const nodes = useCanvasStore((s) => s.nodes);
  const node = nodes.find((n) => n.data.serviceId === serviceId);
  const serviceName = node?.data.name || 'Unknown';

  const startEditing = () => {
    setEditVars(envVars ? [...envVars] : []);
    setEditing(true);
  };

  const addVar = () => {
    setEditVars((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeVar = (index: number) => {
    setEditVars((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVar = (index: number, field: 'key' | 'value', val: string) => {
    setEditVars((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: val } : v)));
  };

  const handleStage = () => {
    addChange({
      id: `env-${serviceId}`,
      serviceId,
      serviceName,
      type: 'env_var',
      envVars: editVars,
      previousEnvVars: envVars || [],
    });
    success('Environment variable changes staged');
    setEditing(false);
  };

  const handleSaveNow = async () => {
    try {
      await updateEnvVars.mutateAsync(editVars);
      success('Environment variables updated');
      setEditing(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update env vars');
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const displayVars = editing ? editVars : (envVars || []);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-300">Environment Variables</p>
        {!editing ? (
          <Button size="sm" variant="secondary" onClick={startEditing}>Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" variant="secondary" onClick={handleSaveNow} loading={updateEnvVars.isPending}>
              Save Now
            </Button>
            <Button size="sm" onClick={handleStage}>
              <Save className="h-3 w-3" />
              Stage
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {displayVars.map((env, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-card-border bg-gray-800/50 p-2">
            {editing ? (
              <>
                <input
                  value={env.key}
                  onChange={(e) => updateVar(i, 'key', e.target.value)}
                  placeholder="KEY"
                  className="flex-1 bg-transparent text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
                />
                <input
                  value={env.value || ''}
                  onChange={(e) => updateVar(i, 'value', e.target.value)}
                  placeholder="value"
                  className="flex-1 bg-transparent text-xs font-mono text-gray-400 placeholder-gray-600 focus:outline-none"
                />
                <button onClick={() => removeVar(i)} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs font-mono font-medium text-white truncate">{env.key}</span>
                <span className="flex-1 text-xs font-mono text-gray-400 truncate">
                  {revealedKeys.has(env.key) ? (env.value || '***') : '*******'}
                </span>
                <button onClick={() => toggleReveal(env.key)} className="text-gray-500 hover:text-gray-300">
                  {revealedKeys.has(env.key) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <Button size="sm" variant="ghost" onClick={addVar}>
          <Plus className="h-3 w-3" />
          Add Variable
        </Button>
      )}

      {displayVars.length === 0 && !editing && (
        <p className="text-center text-xs text-gray-500 py-4">No environment variables</p>
      )}
    </div>
  );
}
