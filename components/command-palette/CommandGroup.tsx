'use client';

interface CommandGroupProps {
  label: string;
}

export function CommandGroup({ label }: CommandGroupProps) {
  return (
    <div className="px-3 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  );
}
