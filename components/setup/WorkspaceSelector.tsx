'use client';

import { User, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Owner } from '@/types';

interface WorkspaceSelectorProps {
  owners: Owner[];
  onSelect: (owner: Owner) => void;
}

export function WorkspaceSelector({ owners, onSelect }: WorkspaceSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Select Workspace</h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose which workspace to visualize
        </p>
      </div>

      <div className="grid gap-3">
        {owners.map((owner) => (
          <Card
            key={owner.id}
            hoverable
            onClick={() => onSelect(owner)}
            className="flex items-center gap-3 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-render-blue/10">
              {owner.type === 'team' ? (
                <Users className="h-5 w-5 text-render-blue" />
              ) : (
                <User className="h-5 w-5 text-render-blue" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{owner.name}</p>
              <p className="text-xs text-gray-500">{owner.email} · {owner.type}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
