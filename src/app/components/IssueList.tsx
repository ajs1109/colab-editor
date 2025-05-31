import React, { useEffect, useState } from 'react';
import { fetchIssues } from '@/api/issues';
import { IIssue } from '@/types';

const IssueList: React.FC<{ repositoryId: string }> = ({ repositoryId }) => {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues(repositoryId);
        setIssues(data);
      } catch (err) {
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [repositoryId]);

  if (loading) return <div>Loading issues...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Issues</h2>
      <ul>
        {issues.map(issue => (
          <li key={issue.id}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>
            <span>Status: {issue.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueList;