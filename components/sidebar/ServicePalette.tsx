'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SERVICE_TYPE_CONFIG } from '@/lib/constants';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { PaletteItem } from './PaletteItem';

const categories = [
  { key: 'compute', label: 'Compute' },
  { key: 'data', label: 'Data' },
  { key: 'static', label: 'Static' },
] as const;

export function ServicePalette() {
  const [search, setSearch] = useState('');
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const filteredTypes = Object.entries(SERVICE_TYPE_CONFIG).filter(([, config]) =>
    config.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        'flex flex-col border-r border-card-border bg-sidebar-bg transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center border-b border-card-border p-3', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && <span className="text-sm font-semibold text-white">Services</span>}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input-border bg-input-bg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-render-blue focus:outline-none focus:ring-1 focus:ring-render-blue"
            />
          </div>
        </div>
      )}

      {/* Service items by category */}
      <div className={cn('flex-1 overflow-y-auto', collapsed ? 'p-2' : 'px-3 pb-3')}>
        {categories.map((cat) => {
          const items = filteredTypes.filter(([, c]) => c.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="mb-4">
              {!collapsed && (
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                  {cat.label}
                </p>
              )}
              <div className={cn('flex flex-col', collapsed ? 'items-center gap-2' : 'gap-2')}>
                {items.map(([type, config]) => (
                  <PaletteItem
                    key={type}
                    type={type}
                    label={config.label}
                    icon={config.icon}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      {!collapsed && (
        <div className="border-t border-card-border p-3">
          <p className="text-xs text-gray-500">Drag a service onto the canvas to create it</p>
        </div>
      )}
    </div>
  );
}
