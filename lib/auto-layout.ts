import dagre from '@dagrejs/dagre';
import { type Node, type Edge } from '@xyflow/react';
import type { ServiceNodeData } from '@/types';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;
const DB_NODE_WIDTH = 220;
const DB_NODE_HEIGHT = 100;

export function autoLayout(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[]
): Node<ServiceNodeData>[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80, marginx: 40, marginy: 40 });

  for (const node of nodes) {
    const isDb = node.data.isDatabase;
    g.setNode(node.id, {
      width: isDb ? DB_NODE_WIDTH : NODE_WIDTH,
      height: isDb ? DB_NODE_HEIGHT : NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const isDb = node.data.isDatabase;
    const width = isDb ? DB_NODE_WIDTH : NODE_WIDTH;
    const height = isDb ? DB_NODE_HEIGHT : NODE_HEIGHT;

    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });
}
