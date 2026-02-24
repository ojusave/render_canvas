'use client';

import { ExternalLink, GitBranch } from 'lucide-react';
import type { ServiceNodeData } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface OverviewTabProps {
  data: ServiceNodeData;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const config = SERVICE_TYPE_CONFIG[data.type];
  const Icon = config?.icon;
  const updatedAt = new Date(data.updatedAt).toLocaleString();

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-render-blue/10">
            <Icon className="h-5 w-5 text-render-blue" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-white">{data.name}</h3>
          <p className="text-xs text-gray-500">{config?.label}</p>
        </div>
      </div>

      <StatusBadge status={data.status} />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.plan && (
          <InfoItem label="Plan" value={data.plan} />
        )}
        {data.region && (
          <InfoItem label="Region" value={data.region} />
        )}
        {data.runtime && (
          <InfoItem label="Runtime" value={data.runtime} />
        )}
        {data.schedule && (
          <InfoItem label="Schedule" value={data.schedule} />
        )}
      </div>

      {/* URL */}
      {data.url && (
        <div className="rounded-lg border border-card-border bg-gray-800/50 p-3">
          <p className="text-xs text-gray-500 mb-1">URL</p>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-render-blue hover:underline"
          >
            {data.url.replace('https://', '')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Repo */}
      {data.repo && (
        <div className="rounded-lg border border-card-border bg-gray-800/50 p-3">
          <p className="text-xs text-gray-500 mb-1">Repository</p>
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <GitBranch className="h-3 w-3 text-gray-500" />
            <span className="truncate">{data.repo}</span>
            {data.branch && <span className="text-gray-500">({data.branch})</span>}
          </div>
        </div>
      )}

      {/* Updated */}
      <p className="text-xs text-gray-500">Last updated: {updatedAt}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-card-border bg-gray-800/50 p-2.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-white capitalize">{value}</p>
    </div>
  );
}
