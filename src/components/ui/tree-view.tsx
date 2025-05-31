'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Folder, File } from 'lucide-react';

const TreeViewContext = React.createContext({});

interface TreeViewProps {
  children: React.ReactNode;
}

export function TreeView({ children }: TreeViewProps) {
  return (
    <TreeViewContext.Provider value={{}}>
      <div className="space-y-1">{children}</div>
    </TreeViewContext.Provider>
  );
}

interface TreeItemProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

export function TreeItem({ value, children, icon, defaultOpen = false }: TreeItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const hasChildren = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === TreeItem
  );

  return (
    <div className="pl-4">
      <div 
        className="flex items-center py-1 hover:bg-accent rounded cursor-pointer"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
          )
        ) : (
          <span className="w-5"></span>
        )}
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
      {isOpen && hasChildren && (
        <div className="pl-4">
          {React.Children.map(children, (child) =>
            React.isValidElement(child) && child.type === TreeItem ? child : null
          )}
        </div>
      )}
    </div>
  );
}