import { type Edge } from '@xyflow/react';
import type { EnvVar, ConnectionEdgeData, RenderPostgres, RenderKeyValue } from '@/types';
import { CONNECTION_PATTERNS, EDGE_COLORS } from '@/lib/constants';
import { renderClient } from './render-client';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchEnvVarsBatched(
  serviceIds: string[]
): Promise<Map<string, EnvVar[]>> {
  const result = new Map<string, EnvVar[]>();
  const batchSize = 5;

  for (let i = 0; i < serviceIds.length; i += batchSize) {
    const batch = serviceIds.slice(i, i + batchSize);
    const promises = batch.map(async (id) => {
      try {
        const data = await renderClient.get<Array<{ envVar: EnvVar; cursor: string }>>(`services/${id}/env-vars`);
        const vars = Array.isArray(data) ? data.map((item) => item.envVar) : [];
        result.set(id, vars);
      } catch {
        result.set(id, []);
      }
    });
    await Promise.all(promises);
    if (i + batchSize < serviceIds.length) {
      await sleep(200);
    }
  }

  return result;
}

function detectConnectionType(value: string): 'postgres' | 'redis' | 'internal' | 'unknown' {
  for (const { type, pattern } of CONNECTION_PATTERNS) {
    if (pattern.test(value)) return type;
  }
  return 'unknown';
}

function findTargetByHostname(
  value: string,
  databases: RenderPostgres[],
  keyValues: RenderKeyValue[],
  serviceNames: Map<string, string>
): string | null {
  // Check postgres connection strings
  for (const db of databases) {
    if (db.primaryConnectionString && value.includes(db.primaryConnectionString.split('@')[1]?.split('/')[0] || '___never_match___')) {
      return db.id;
    }
    // Also match by database name in the connection string
    if (value.includes(db.databaseName) && value.includes('postgres')) {
      return db.id;
    }
  }

  // Check for .onrender.com hostnames matching service names
  const onrenderMatch = value.match(/([a-z0-9-]+)\.onrender\.com/i);
  if (onrenderMatch) {
    const hostname = onrenderMatch[1].toLowerCase();
    for (const [id, name] of serviceNames) {
      if (hostname.includes(name.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
        return id;
      }
    }
  }

  // Check redis/KV
  for (const kv of keyValues) {
    if (value.toLowerCase().includes('redis') || value.toLowerCase().includes(kv.name.toLowerCase())) {
      return kv.id;
    }
  }

  return null;
}

export async function detectConnections(
  serviceIds: string[],
  databases: RenderPostgres[],
  keyValues: RenderKeyValue[],
  serviceNames: Map<string, string>
): Promise<Edge<ConnectionEdgeData>[]> {
  const envVarsMap = await fetchEnvVarsBatched(serviceIds);
  const edges: Edge<ConnectionEdgeData>[] = [];
  const seenEdges = new Set<string>();

  for (const [serviceId, envVars] of envVarsMap) {
    for (const env of envVars) {
      if (!env.value) continue;

      const connType = detectConnectionType(env.value);
      if (connType === 'unknown' && !env.value.includes('.onrender.com')) continue;

      const targetId = findTargetByHostname(env.value, databases, keyValues, serviceNames);
      if (!targetId || targetId === serviceId) continue;

      const edgeKey = `${serviceId}-${targetId}`;
      if (seenEdges.has(edgeKey)) continue;
      seenEdges.add(edgeKey);

      edges.push({
        id: `edge-${edgeKey}`,
        source: targetId,
        target: serviceId,
        type: 'connectionEdge',
        animated: true,
        style: { stroke: EDGE_COLORS[connType] || EDGE_COLORS.unknown },
        data: {
          envVarKey: env.key,
          sourceType: 'database',
          targetType: 'service',
          connectionType: connType,
          healthy: true,
        },
      });
    }
  }

  return edges;
}
