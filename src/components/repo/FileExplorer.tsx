import { File } from '@/types/project';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { TreeView, TreeItem } from '@/components/ui/tree-view';

interface FileExplorerProps {
  files: File[];
  repo: { name: string };
  username: string;
  branch: string;
}

export function FileExplorer({ files, repo, username, branch }: FileExplorerProps) {
  const buildTree = (items: File[], path = '') => {
    const tree: { [key: string]: any } = {};
    
    items.forEach((item) => {
      const parts = item.path.replace(path, '').split('/').filter(p => p);
      let currentLevel = tree;
      
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        
        if (index === parts.length - 1) {
          currentLevel[part].file = item;
        }
        
        currentLevel = currentLevel[part];
      });
    });
    
    return tree;
  };

  const renderTree = (nodes: any, parentPath = '') => {
    return Object.keys(nodes).map((key) => {
      const node = nodes[key];
      const currentPath = parentPath ? `${parentPath}/${key}` : key;
      
      if (node.file) {
        return (
          <TreeItem 
            key={currentPath} 
            value={currentPath}
            icon={<Icons.file className="h-4 w-4 text-blue-500" />}
          >
            <Link 
              href={`/${username}/${repo.name}/blob/${branch}/${currentPath}`}
              className="hover:text-blue-600 hover:underline"
            >
              {key}
            </Link>
          </TreeItem>
        );
      }
      
      return (
        <TreeItem 
          key={currentPath} 
          value={currentPath}
          icon={<Icons.folder className="h-4 w-4 text-yellow-500" />}
          defaultOpen
        >
          {key}
          {renderTree(node, currentPath)}
        </TreeItem>
      );
    });
  };

  const treeData = buildTree(files);

  return (
    <div className="bg-background rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Files</h3>
        <button title='refresh' className="text-sm text-muted-foreground hover:text-foreground">
          <Icons.refresh className="h-4 w-4" />
        </button>
      </div>
      <TreeView>
        {renderTree(treeData)}
      </TreeView>
    </div>
  );
}