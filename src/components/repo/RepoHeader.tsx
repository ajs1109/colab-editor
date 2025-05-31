import { Repository, User, Branch } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface RepoHeaderProps {
  repo: Repository;
  owner: User;
  branches: Branch[];
  currentBranch: Branch;
}

export function RepoHeader({ repo, owner, branches, currentBranch }: RepoHeaderProps) {
  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Icons.book className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">
                <span className="hover:underline cursor-pointer">{owner.username}</span>
                <span className="mx-1">/</span>
                <span className="hover:underline cursor-pointer font-bold">{repo.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground">{repo.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Icons.gitBranch className="mr-2 h-4 w-4" />
                    {currentBranch.name}
                    <Icons.chevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.name}>
                      <Icons.gitBranch className="mr-2 h-4 w-4" />
                      <span>{branch.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button variant="outline">
              <Icons.eye className="mr-2 h-4 w-4" />
              Watch
            </Button>
            
            <Button variant="outline">
              <Icons.star className="mr-2 h-4 w-4" />
              Star
            </Button>
            
            <Button variant="outline">
              <Icons.gitFork className="mr-2 h-4 w-4" />
              Fork
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}