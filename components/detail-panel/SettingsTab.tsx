'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, Save, Pencil } from 'lucide-react';
import type { ServiceNodeData, UpdateServiceForm } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import { useUpdateService } from '@/hooks/use-update-service';
import { useToast } from '@/components/ui/Toast';
import { useStagedChangesStore } from '@/store/staged-changes-store';

interface SettingsTabProps {
  data: ServiceNodeData;
  serviceId: string;
}

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'standard', label: 'Standard' },
  { value: 'pro', label: 'Pro' },
  { value: 'pro_plus', label: 'Pro Plus' },
  { value: 'pro_max', label: 'Pro Max' },
  { value: 'pro_ultra', label: 'Pro Ultra' },
];

export function SettingsTab({ data, serviceId }: SettingsTabProps) {
  const openDeleteConfirm = useUIStore((s) => s.openDeleteConfirm);
  const updateService = useUpdateService(serviceId);
  const { success, error: showError } = useToast();
  const addChange = useStagedChangesStore((s) => s.addChange);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateServiceForm>({
    name: data.name,
    branch: data.branch || '',
    autoDeploy: (data.autoDeploy as 'yes' | 'no') || 'yes',
    serviceDetails: {},
  });

  const isDatabase = data.isDatabase;

  const startEditing = () => {
    setForm({
      name: data.name,
      branch: data.branch || '',
      autoDeploy: (data.autoDeploy as 'yes' | 'no') || 'yes',
      serviceDetails: {
        buildCommand: (data.buildCommand as string) || '',
        startCommand: (data.startCommand as string) || '',
        plan: data.plan || '',
        healthCheckPath: (data.healthCheckPath as string) || '',
        schedule: data.schedule || '',
        publishPath: (data.publishPath as string) || '',
      },
    });
    setEditing(true);
  };

  const handleStage = () => {
    addChange({
      id: `config-${serviceId}`,
      serviceId,
      serviceName: data.name,
      type: 'config',
      config: form,
    });
    success('Changes staged for review');
    setEditing(false);
  };

  const handleSaveNow = async () => {
    try {
      await updateService.mutateAsync(form);
      success('Service updated successfully');
      setEditing(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update service');
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateDetail = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      serviceDetails: { ...prev.serviceDetails, [field]: value },
    }));
  };

  if (isDatabase) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="rounded-lg border border-card-border bg-gray-800/50 p-4">
          <p className="text-sm text-gray-400">Settings are not editable for databases.</p>
        </div>
        {/* Links */}
        <QuickLinks data={data} />
        {/* Danger Zone */}
        <DangerZone serviceId={data.serviceId} name={data.name} openDeleteConfirm={openDeleteConfirm} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Edit toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-300">Service Settings</p>
        {!editing ? (
          <Button size="sm" variant="secondary" onClick={startEditing}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" variant="secondary" onClick={handleSaveNow} loading={updateService.isPending}>
              Save Now
            </Button>
            <Button size="sm" onClick={handleStage}>
              <Save className="h-3 w-3" />
              Stage
            </Button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        {editing ? (
          <>
            <Input
              label="Name"
              value={form.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <Input
              label="Branch"
              value={form.branch || ''}
              onChange={(e) => updateField('branch', e.target.value)}
            />
            <Input
              label="Build Command"
              value={form.serviceDetails?.buildCommand || ''}
              onChange={(e) => updateDetail('buildCommand', e.target.value)}
            />
            {data.type !== 'static_site' && data.type !== 'cron_job' && (
              <Input
                label="Start Command"
                value={form.serviceDetails?.startCommand || ''}
                onChange={(e) => updateDetail('startCommand', e.target.value)}
              />
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Plan</label>
              <select
                value={form.serviceDetails?.plan || ''}
                onChange={(e) => updateDetail('plan', e.target.value)}
                className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-render-blue"
              >
                {PLAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">Auto-Deploy</label>
              <button
                onClick={() => updateField('autoDeploy', form.autoDeploy === 'yes' ? 'no' : 'yes')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.autoDeploy === 'yes' ? 'bg-render-blue' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.autoDeploy === 'yes' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {(data.type === 'web_service' || data.type === 'private_service') && (
              <Input
                label="Health Check Path"
                value={form.serviceDetails?.healthCheckPath || ''}
                onChange={(e) => updateDetail('healthCheckPath', e.target.value)}
                placeholder="/healthz"
              />
            )}
            {data.type === 'cron_job' && (
              <Input
                label="Schedule"
                value={form.serviceDetails?.schedule || ''}
                onChange={(e) => updateDetail('schedule', e.target.value)}
                placeholder="*/5 * * * *"
              />
            )}
            {data.type === 'static_site' && (
              <Input
                label="Publish Path"
                value={form.serviceDetails?.publishPath || ''}
                onChange={(e) => updateDetail('publishPath', e.target.value)}
                placeholder="./build"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <SettingRow label="Name" value={data.name} />
            {data.branch && <SettingRow label="Branch" value={data.branch} />}
            {data.plan && <SettingRow label="Plan" value={data.plan} />}
            {data.runtime && <SettingRow label="Runtime" value={data.runtime} />}
            {data.schedule && <SettingRow label="Schedule" value={data.schedule} />}
          </div>
        )}
      </div>

      {/* Links */}
      <QuickLinks data={data} />

      {/* Danger Zone */}
      <DangerZone serviceId={data.serviceId} name={data.name} openDeleteConfirm={openDeleteConfirm} />
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-card-border bg-gray-800/50 px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function QuickLinks({ data }: { data: ServiceNodeData }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-300 mb-3">Quick Links</p>
      <div className="flex flex-col gap-2">
        {data.dashboardUrl && (
          <a
            href={data.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-render-blue hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Render Dashboard
          </a>
        )}
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-render-blue hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Visit Live URL
          </a>
        )}
      </div>
    </div>
  );
}

function DangerZone({
  serviceId,
  name,
  openDeleteConfirm,
}: {
  serviceId: string;
  name: string;
  openDeleteConfirm: (id: string, name: string) => void;
}) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm font-medium text-red-400 mb-2">Danger Zone</p>
      <p className="text-xs text-gray-400 mb-3">
        Permanently delete this service and all its data. This action cannot be undone.
      </p>
      <Button
        variant="danger"
        size="sm"
        onClick={() => openDeleteConfirm(serviceId, name)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete Service
      </Button>
    </div>
  );
}
