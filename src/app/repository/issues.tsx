import { useEffect, useState } from 'react';
import { fetchIssues } from '@/api/issues';
import IssueList from '@/components/IssueList';

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  if (loading) return <div>Loading issues...</div>;
  if (error) return <div>Error loading issues: {error.message}</div>;

  return (
    <div>
      <h1>Issues</h1>
      <IssueList issues={issues} />
    </div>
  );
};

export default IssuesPage;