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
    <div className="min-h-screen bg-gray-50">
      <RepoHeader 
        repo={sampleRepo} 
        owner={sampleUser} 
        branches={[]} 
        currentBranch={{ name: 'main', commit:sampleCommits[0], protected: false }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RepoNav 
          repo={sampleRepo} 
          currentTab="issues" 
          username={params.username} 
        />
        
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="font-medium">
                <Icons.alertCircle className="mr-2 h-4 w-4" />
                Open
              </Button>
              <Button variant="ghost">
                <Icons.checkCircle className="mr-2 h-4 w-4" />
                Closed
              </Button>
            </div>
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sampleIssues.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="mr-3 pt-1">
                    <Icons.alertCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Link 
                      href={`/${params.username}/${params.repo}/issues/${issue.id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {issue.title}
                    </Link>
                    <div className="mt-1 text-sm text-gray-500">
                      #{issue.id} opened on {new Date(issue.created_at).toLocaleDateString()} by {issue.author.username}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {issue.labels.map((label) => (
                      <span 
                        key={label.id}
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
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