import React from 'react';
import { usePullRequests } from '../hooks/useRepository';
import PullRequestItem from './PullRequestItem';

const PullRequestList = () => {
  const { pullRequests, loading, error } = usePullRequests();

  if (loading) {
    return <div>Loading pull requests...</div>;
  }

  if (error) {
    return <div>Error loading pull requests: {error.message}</div>;
  }

  return (
    <div>
      <h2>Pull Requests</h2>
      {pullRequests.length === 0 ? (
        <p>No pull requests available.</p>
      ) : (
        <ul>
          {pullRequests.map(pr => (
            <PullRequestItem key={pr.id} pullRequest={pr} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PullRequestList;