import { type Node } from '@xyflow/react';
import type { RenderService, RenderPostgres, RenderKeyValue, ServiceNodeData } from '@/types';

function serviceTypeToNodeType(type: string): string {
  const map: Record<string, string> = {
    web_service: 'webServiceNode',
    private_service: 'privateServiceNode',
    background_worker: 'backgroundWorkerNode',
    static_site: 'staticSiteNode',
    cron_job: 'cronJobNode',
    postgres: 'postgresNode',
    key_value: 'keyValueNode',
  };
  return map[type] || 'webServiceNode';
}

export function mapServicesToNodes(
  services: RenderService[],
  databases: RenderPostgres[],
  keyValues: RenderKeyValue[],
  positionMap?: Record<string, { x: number; y: number }>,
  pendingPositions?: Record<string, { x: number; y: number }>
): Node<ServiceNodeData>[] {
  const nodes: Node<ServiceNodeData>[] = [];

  for (const svc of services) {
    const pos = pendingPositions?.[svc.id] || positionMap?.[svc.id] || { x: 0, y: 0 };
    nodes.push({
      id: svc.id,
      type: serviceTypeToNodeType(svc.type),
      position: pos,
      data: {
        serviceId: svc.id,
        name: svc.name,
        type: svc.type,
        status: svc.suspended === 'suspended' ? 'suspended' : svc.status,
        url: svc.serviceDetails?.url,
        repo: svc.repo,
        branch: svc.branch,
        plan: svc.serviceDetails?.plan,
        region: svc.serviceDetails?.region,
        updatedAt: svc.updatedAt,
        dashboardUrl: svc.dashboardUrl,
        runtime: svc.serviceDetails?.runtime || svc.serviceDetails?.env,
        schedule: svc.serviceDetails?.schedule,
        isDatabase: false,
      },
    });
  }

  for (const db of databases) {
    const pos = pendingPositions?.[db.id] || positionMap?.[db.id] || { x: 0, y: 0 };
    nodes.push({
      id: db.id,
      type: 'postgresNode',
      position: pos,
      data: {
        serviceId: db.id,
        name: db.name,
        type: 'postgres',
        status: db.status,
        plan: db.plan,
        region: db.region,
        updatedAt: db.updatedAt,
        dashboardUrl: db.dashboardUrl,
        isDatabase: true,
      },
    });
  }

  for (const kv of keyValues) {
    const pos = pendingPositions?.[kv.id] || positionMap?.[kv.id] || { x: 0, y: 0 };
    nodes.push({
      id: kv.id,
      type: 'keyValueNode',
      position: pos,
      data: {
        serviceId: kv.id,
        name: kv.name,
        type: 'key_value',
        status: kv.status,
        plan: kv.plan,
        region: kv.region,
        updatedAt: kv.updatedAt,
        dashboardUrl: kv.dashboardUrl,
        isDatabase: true,
      },
    });
  }

  return nodes;
}
