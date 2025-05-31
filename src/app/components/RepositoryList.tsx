import React from 'react';

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
  stars: number;
  forks: number;
}

interface RepositoryListProps {
  repositories: Repository[];
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  return (
    <div className="repository-list">
      <h2>Your Repositories</h2>
      <ul>
        {repositories.map(repo => (
          <li key={repo.id} className="repository-item">
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <p>Owner: {repo.owner}</p>
            <p>Stars: {repo.stars} | Forks: {repo.forks}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepositoryList;