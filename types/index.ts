// ─── Render API Types ───

export type ServiceType =
  | 'web_service'
  | 'private_service'
  | 'background_worker'
  | 'static_site'
  | 'cron_job';

export type ServiceStatus =
  | 'created'
  | 'building'
  | 'deploying'
  | 'live'
  | 'deactivated'
  | 'suspended'
  | 'failed'
  | 'pre_deploy_in_progress'
  | 'pre_deploy_failed'
  | 'update_in_progress';

export type DatabaseStatus =
  | 'creating'
  | 'available'
  | 'unavailable'
  | 'suspended';

export interface RenderService {
  id: string;
  name: string;
  type: ServiceType;
  slug: string;
  status: ServiceStatus;
  suspended: 'suspended' | 'not_suspended';
  autoDeploy: 'yes' | 'no';
  branch: string;
  buildFilter?: { paths: string[]; ignoredPaths: string[] };
  createdAt: string;
  updatedAt: string;
  dashboardUrl: string;
  repo: string;
  serviceDetails: {
    buildCommand?: string;
    startCommand?: string;
    url?: string;
    region?: string;
    plan?: string;
    runtime?: string;
    env?: string;
    docker?: { dockerCommand?: string; dockerfilePath?: string };
    envSpecificDetails?: {
      docker?: { dockerCommand?: string; dockerfilePath?: string };
      nativeRuntime?: { buildCommand?: string; startCommand?: string };
    };
    schedule?: string;
    lastSuccessfulRunAt?: string;
    publishPath?: string;
    pullRequestPreviewsEnabled?: 'yes' | 'no';
    parentServer?: { id: string; name: string };
    openPorts?: Array<{ port: number; protocol: string }>;
    numInstances?: number;
    healthCheckPath?: string;
  };
  rootDir?: string;
  notifyOnFail: 'default' | 'notify' | 'ignore';
  imagePath?: string;
}

export interface RenderPostgres {
  id: string;
  name: string;
  databaseName: string;
  databaseUser: string;
  plan: string;
  status: DatabaseStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  dashboardUrl: string;
  primaryConnectionString: string;
  readReplicas?: Array<{ id: string; name: string }>;
  ipAllowList?: Array<{ cidrBlock: string; description: string }>;
  owner: { id: string; name: string; email?: string; type: string };
  region?: string;
  highAvailabilityEnabled?: boolean;
  role?: string;
}

export interface RenderKeyValue {
  id: string;
  name: string;
  plan: string;
  status: DatabaseStatus;
  createdAt: string;
  updatedAt: string;
  dashboardUrl: string;
  maxMemoryPolicy: string;
  owner: { id: string; name: string; email?: string; type: string };
  region?: string;
}

export interface Deploy {
  id: string;
  commit?: { id: string; message: string; createdAt: string };
  status: 'created' | 'build_in_progress' | 'update_in_progress' | 'live' | 'deactivated' | 'build_failed' | 'update_failed' | 'canceled' | 'pre_deploy_in_progress' | 'pre_deploy_failed';
  trigger: 'api' | 'deploy_hook' | 'github_push' | 'gitlab_push' | 'manual' | 'new_commit' | 'other' | 'rollback';
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvVar {
  key: string;
  value?: string;
  generateValue?: boolean;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'team';
}

export interface Metric {
  time: string;
  value: number;
}

export interface MetricResponse {
  labels: Array<{ field: string; value: string }>;
  unit: string;
  values: Array<{ timestamp: string; value: number }>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
}

// ─── Canvas Types ───

export type ServiceNodeData = {
  serviceId: string;
  name: string;
  type: ServiceType | 'postgres' | 'key_value';
  status: string;
  url?: string;
  repo?: string;
  branch?: string;
  plan?: string;
  region?: string;
  updatedAt: string;
  dashboardUrl: string;
  failureReason?: string;
  schedule?: string;
  runtime?: string;
  isDatabase?: boolean;
  isDropTarget?: boolean;
  groupId?: string;
  [key: string]: unknown;
};

export type ConnectionEdgeData = {
  envVarKey: string;
  sourceType: string;
  targetType: string;
  connectionType: 'postgres' | 'redis' | 'internal' | 'unknown';
  healthy: boolean;
  [key: string]: unknown;
};

export interface CanvasSchema {
  version: number;
  workspaceId: string;
  positions: Record<string, { x: number; y: number }>;
  groups?: Record<string, { nodeIds: string[] }>;
  timestamp: number;
}

// ─── Session Types ───

export interface SessionData {
  apiKey?: string;
  workspaceId?: string;
  workspaceName?: string;
}

// ─── Form Types ───

export interface CreateServiceForm {
  type: ServiceType | 'postgres' | 'key_value';
  name: string;
  repo?: string;
  branch?: string;
  buildCommand?: string;
  startCommand?: string;
  envVars?: EnvVar[];
  plan?: string;
  region?: string;
  runtime?: string;
  schedule?: string;
  publishPath?: string;
  dockerCommand?: string;
  dockerfilePath?: string;
  healthCheckPath?: string;
  numInstances?: number;
  autoDeploy?: boolean;
  // Postgres specific
  databaseName?: string;
  databaseUser?: string;
  version?: string;
  // Key-Value specific
  maxMemoryPolicy?: string;
}

export interface UpdateServiceForm {
  name?: string;
  autoDeploy?: 'yes' | 'no';
  branch?: string;
  serviceDetails?: {
    buildCommand?: string;
    startCommand?: string;
    plan?: string;
    healthCheckPath?: string;
    numInstances?: number;
    schedule?: string;
    publishPath?: string;
  };
}

// ─── Group Types ───

export interface GroupNodeData {
  label: string;
  collapsed: boolean;
  childNodeIds: string[];
  isDropTarget?: boolean;
  [key: string]: unknown;
}

// ─── Staged Changes Types ───

export interface StagedChange {
  id: string;
  serviceId: string;
  serviceName: string;
  type: 'env_var' | 'config';
  envVars?: EnvVar[];
  config?: UpdateServiceForm;
  previousEnvVars?: EnvVar[];
  previousConfig?: Record<string, unknown>;
}

// ─── API Response Types ───

export interface PaginatedResponse<T> {
  cursor: string;
  [key: string]: T | string;
}

export interface ApiError {
  id: string;
  message: string;
}

// ─── Utility Types ───

export type NodeType =
  | 'webServiceNode'
  | 'privateServiceNode'
  | 'backgroundWorkerNode'
  | 'staticSiteNode'
  | 'cronJobNode'
  | 'postgresNode'
  | 'keyValueNode'
  | 'groupNode';
