import {
  Globe,
  Lock,
  Cpu,
  FileCode,
  Clock,
  Database,
  HardDrive,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_TYPE_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; category: 'compute' | 'data' | 'static' }
> = {
  web_service: { icon: Globe, label: 'Web Service', category: 'compute' },
  private_service: { icon: Lock, label: 'Private Service', category: 'compute' },
  background_worker: { icon: Cpu, label: 'Background Worker', category: 'compute' },
  static_site: { icon: FileCode, label: 'Static Site', category: 'static' },
  cron_job: { icon: Clock, label: 'Cron Job', category: 'compute' },
  postgres: { icon: Database, label: 'PostgreSQL', category: 'data' },
  key_value: { icon: HardDrive, label: 'Key Value (Redis)', category: 'data' },
};

export const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  live: { dot: 'bg-status-green', bg: 'bg-status-green/10', text: 'text-status-green' },
  available: { dot: 'bg-status-green', bg: 'bg-status-green/10', text: 'text-status-green' },
  deploying: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  building: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  build_in_progress: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  update_in_progress: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  pre_deploy_in_progress: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  creating: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  created: { dot: 'bg-status-blue', bg: 'bg-status-blue/10', text: 'text-status-blue' },
  failed: { dot: 'bg-status-red', bg: 'bg-status-red/10', text: 'text-status-red' },
  build_failed: { dot: 'bg-status-red', bg: 'bg-status-red/10', text: 'text-status-red' },
  update_failed: { dot: 'bg-status-red', bg: 'bg-status-red/10', text: 'text-status-red' },
  pre_deploy_failed: { dot: 'bg-status-red', bg: 'bg-status-red/10', text: 'text-status-red' },
  suspended: { dot: 'bg-status-amber', bg: 'bg-status-amber/10', text: 'text-status-amber' },
  deactivated: { dot: 'bg-status-gray', bg: 'bg-status-gray/10', text: 'text-status-gray' },
  unavailable: { dot: 'bg-status-red', bg: 'bg-status-red/10', text: 'text-status-red' },
  canceled: { dot: 'bg-status-gray', bg: 'bg-status-gray/10', text: 'text-status-gray' },
};

export const EDGE_COLORS: Record<string, string> = {
  postgres: '#4351E8',
  redis: '#59FFA4',
  internal: '#6b7280',
  unknown: '#6b7280',
};

export const CONNECTION_PATTERNS = [
  { type: 'postgres' as const, pattern: /postgres(?:ql)?:\/\//i },
  { type: 'redis' as const, pattern: /redis(?:s)?:\/\//i },
  { type: 'internal' as const, pattern: /\.onrender\.com/i },
];

export const QUERY_KEYS = {
  auth: ['auth'] as const,
  services: ['services'] as const,
  databases: ['databases'] as const,
  postgres: ['postgres'] as const,
  keyValue: ['keyValue'] as const,
  deploys: (serviceId: string) => ['deploys', serviceId] as const,
  metrics: (serviceId: string) => ['metrics', serviceId] as const,
  logs: (serviceId: string) => ['logs', serviceId] as const,
  envVars: (serviceId: string) => ['envVars', serviceId] as const,
  owners: ['owners'] as const,
};

export const REFETCH_INTERVALS = {
  services: 30_000,
  deploys: 15_000,
  metrics: 60_000,
  logs: 10_000,
};
