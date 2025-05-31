import React, { useEffect, useState } from 'react';
import { fetchPullRequests } from '@/lib/apiClient';
import PullRequestList from '@/components/PullRequestList';

const PullRequestsPage = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPullRequests = async () => {
      try {
        const data = await fetchPullRequests();
        setPullRequests(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPullRequests();
  }, []);

  if (loading) return <div>Loading pull requests...</div>;
  if (error) return <div>Error loading pull requests: {error.message}</div>;

  return (
    <div>
      <h1>Pull Requests</h1>
      <PullRequestList pullRequests={pullRequests} />
    </div>
  );
};

export default PullRequestsPage;