'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useCreateService } from '@/hooks/use-create-service';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SERVICE_TYPE_CONFIG } from '@/lib/constants';
import type { CreateServiceForm } from '@/types';

const regionOptions = [
  { value: 'oregon', label: 'Oregon (US West)' },
  { value: 'ohio', label: 'Ohio (US East)' },
  { value: 'virginia', label: 'Virginia (US East)' },
  { value: 'frankfurt', label: 'Frankfurt (EU)' },
  { value: 'singapore', label: 'Singapore (Asia)' },
];

const runtimeOptions = [
  { value: 'node', label: 'Node' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'docker', label: 'Docker' },
];

const computePlanOptions = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'standard', label: 'Standard' },
  { value: 'pro', label: 'Pro' },
  { value: 'pro_plus', label: 'Pro Plus' },
  { value: 'pro_max', label: 'Pro Max' },
  { value: 'pro_ultra', label: 'Pro Ultra' },
];

const postgresPlanOptions = [
  { value: 'free', label: 'Free' },
  { value: 'basic_256mb', label: 'Basic 256MB' },
  { value: 'basic_1gb', label: 'Basic 1GB' },
  { value: 'basic_4gb', label: 'Basic 4GB' },
  { value: 'pro_4gb', label: 'Pro 4GB' },
  { value: 'pro_8gb', label: 'Pro 8GB' },
];

const keyValuePlanOptions = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'standard', label: 'Standard' },
  { value: 'pro', label: 'Pro' },
  { value: 'pro_plus', label: 'Pro Plus' },
];

export function CreateServiceDialog() {
  const open = useUIStore((s) => s.createDialogOpen);
  const type = useUIStore((s) => s.createDialogType);
  const position = useUIStore((s) => s.createDialogPosition);
  const closeDialog = useUIStore((s) => s.closeCreateDialog);
  const addPendingPosition = useCanvasStore((s) => s.addPendingPosition);
  const createService = useCreateService();
  const { success, error: showError } = useToast();

  const [form, setForm] = useState<Partial<CreateServiceForm>>({});

  const typeConfig = type ? SERVICE_TYPE_CONFIG[type] : null;
  const isDatabase = type === 'postgres' || type === 'key_value';
  const isStaticSite = type === 'static_site';
  const isCronJob = type === 'cron_job';
  const needsRepo = !isDatabase;

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    try {
      const result = await createService.mutateAsync({
        type,
        name: form.name || '',
        repo: form.repo,
        branch: form.branch,
        buildCommand: form.buildCommand,
        startCommand: form.startCommand,
        plan: form.plan,
        region: form.region,
        runtime: form.runtime,
        schedule: form.schedule,
        publishPath: form.publishPath,
        databaseName: form.databaseName,
        databaseUser: form.databaseUser,
        version: form.version,
        maxMemoryPolicy: form.maxMemoryPolicy,
      });
      // Save the drop position so the new node appears where the user dropped it
      if (result && 'id' in result && position) {
        addPendingPosition(result.id, position);
      }
      success(`${typeConfig?.label || 'Service'} created successfully`);
      setForm({});
      closeDialog();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create service');
    }
  };

  const handleClose = () => {
    setForm({});
    closeDialog();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={`Create ${typeConfig?.label || 'Service'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          placeholder="my-service"
          required
          value={form.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
        />

        {needsRepo && (
          <>
            <Input
              label="Repository URL"
              placeholder="https://github.com/user/repo"
              required
              value={form.repo || ''}
              onChange={(e) => updateField('repo', e.target.value)}
            />
            <Input
              label="Branch"
              placeholder="main"
              value={form.branch || ''}
              onChange={(e) => updateField('branch', e.target.value)}
            />
          </>
        )}

        {needsRepo && !isStaticSite && (
          <Select
            label="Runtime"
            options={runtimeOptions}
            value={form.runtime || 'node'}
            onChange={(e) => updateField('runtime', e.target.value)}
          />
        )}

        {needsRepo && (
          <Input
            label="Build Command"
            placeholder="npm install && npm run build"
            value={form.buildCommand || ''}
            onChange={(e) => updateField('buildCommand', e.target.value)}
          />
        )}

        {!isDatabase && !isStaticSite && (
          <Input
            label="Start Command"
            placeholder="npm start"
            value={form.startCommand || ''}
            onChange={(e) => updateField('startCommand', e.target.value)}
          />
        )}

        {isStaticSite && (
          <Input
            label="Publish Path"
            placeholder="./build"
            value={form.publishPath || ''}
            onChange={(e) => updateField('publishPath', e.target.value)}
          />
        )}

        {isCronJob && (
          <Input
            label="Schedule (cron expression)"
            placeholder="0 */6 * * *"
            required
            value={form.schedule || ''}
            onChange={(e) => updateField('schedule', e.target.value)}
          />
        )}

        {type === 'postgres' && (
          <>
            <Input
              label="Database Name"
              placeholder="mydb"
              value={form.databaseName || ''}
              onChange={(e) => updateField('databaseName', e.target.value)}
            />
            <Input
              label="Database User"
              placeholder="myuser"
              value={form.databaseUser || ''}
              onChange={(e) => updateField('databaseUser', e.target.value)}
            />
          </>
        )}

        <div className="flex gap-3">
          <Select
            label="Plan"
            options={type === 'postgres' ? postgresPlanOptions : type === 'key_value' ? keyValuePlanOptions : computePlanOptions}
            value={form.plan || 'free'}
            onChange={(e) => updateField('plan', e.target.value)}
          />
          <Select
            label="Region"
            options={regionOptions}
            value={form.region || 'oregon'}
            onChange={(e) => updateField('region', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createService.isPending}>
            Create {typeConfig?.label || 'Service'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
