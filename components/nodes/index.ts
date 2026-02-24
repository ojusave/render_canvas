import { type NodeTypes } from '@xyflow/react';
import { WebServiceNode } from './WebServiceNode';
import { PrivateServiceNode } from './PrivateServiceNode';
import { BackgroundWorkerNode } from './BackgroundWorkerNode';
import { StaticSiteNode } from './StaticSiteNode';
import { CronJobNode } from './CronJobNode';
import { PostgresNode } from './PostgresNode';
import { KeyValueNode } from './KeyValueNode';
import { GroupNode } from './GroupNode';

export const nodeTypes: NodeTypes = {
  webServiceNode: WebServiceNode,
  privateServiceNode: PrivateServiceNode,
  backgroundWorkerNode: BackgroundWorkerNode,
  staticSiteNode: StaticSiteNode,
  cronJobNode: CronJobNode,
  postgresNode: PostgresNode,
  keyValueNode: KeyValueNode,
  groupNode: GroupNode,
};
