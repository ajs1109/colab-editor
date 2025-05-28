'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ProjectListHeaderProps {
  tab: 'active' | 'all' | 'closed';
  count: number;
  sortOrder: 'newest' | 'oldest';
  onSort?: (order: 'newest' | 'oldest') => void;
}

export const ProjectListHeader = ({
  tab,
  count,
  sortOrder,
  onSort,
}: ProjectListHeaderProps) => (
  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-6">
    <div>
      <span className="text-sm">
        {tab === 'active' && `Active Projects(${count})`}
        {tab === 'closed' && `Closed Projects(${count})`}
        {tab === 'all' && `All Projects(${count})`}
      </span>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center">
        <span className="text-sm">Sort</span>
        <ChevronDown className="w-4 h-4 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSort?.('newest')}>
          Newest {sortOrder === 'newest' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort?.('oldest')}>
          Oldest {sortOrder === 'oldest' && '✓'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
