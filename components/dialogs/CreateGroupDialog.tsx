'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (label: string) => void;
}

export function CreateGroupDialog({ open, onClose, onCreate }: CreateGroupDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create Group">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Backend Services"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
