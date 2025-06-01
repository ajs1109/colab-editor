import { RepoHeader } from '@/components/repo/RepoHeader';
import { RepoNav } from '@/components/repo/RepoNav';
import { sampleRepo, sampleUser, sampleIssues, sampleCommits } from '@/lib/sample-data';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

export default function IssuesPage({
  params,
}: {
  params: { username: string; repo: string };
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <RepoHeader 
        repo={sampleRepo} 
        owner={sampleUser} 
        currentBranch={{ name: 'main', commit: sampleCommits[0], protected: false }} 
      />
      
      <div className="container py-8">
        <div className="border-b border-border">
          <RepoNav 
            repo={sampleRepo} 
            currentTab="issues" 
            username={params.username} 
          />
        </div>
        
        <div className="mt-6 bg-muted/10 border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-medium hover:bg-muted/50">
                <Icons.alertCircle className="mr-2 h-4 w-4" />
                Open
              </Button>
              <Button variant="ghost" className="hover:bg-muted/50">
                <Icons.checkCircle className="mr-2 h-4 w-4" />
                Closed
              </Button>
            </div>
            <Button className="gap-2">
              <Icons.plus className="h-4 w-4" />
              New Issue
            </Button>
          </div>
          
          <div className="divide-y divide-border">
            {sampleIssues.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <Icons.alertCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <Link 
                      href={`/${params.username}/${params.repo}/issues/${issue.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {issue.title}
                    </Link>
                    <div className="mt-1 text-sm text-muted-foreground">
                      #{issue.id} opened on {new Date(issue.created_at).toLocaleDateString()} by {issue.author.username}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {issue.labels.map((label) => (
                      <span 
                        key={label.id}
                        className="px-2 py-0.5 text-xs rounded-full font-medium"
                        style={{ 
                          backgroundColor: `#${label.color}20`, 
                          color: `#${label.color}`,
                          border: `1px solid #${label.color}40`
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}