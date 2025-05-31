import React from 'react';

interface RepositoryOverviewProps {
  repository: {
    name: string;
    description?: string;
    stars?: number;
    forks?: number;
    watchers?: number;
    language?: string;
    updatedAt?: string;
    owner?: {
      username: string;
      avatarUrl?: string;
    };
  };
}

const RepositoryOverview: React.FC<{ repository: any }> = ({ repository }) => {
  if (!repository) return null;

  return (
    <section className="repo-overview" style={{ padding: '2rem', borderBottom: '1px solid #e1e4e8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {repository.owner?.avatarUrl && (
          <img
            src={repository.owner.avatarUrl}
            alt={repository.owner.username}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        )}
        <h2 style={{ margin: 0 }}>
          {repository.owner?.username && (
            <span style={{ color: '#0366d6' }}>{repository.owner.username} / </span>
          )}
          <span style={{ fontWeight: 600 }}>{repository.name}</span>
        </h2>
      </div>
      {repository.description && (
        <p style={{ margin: '1rem 0', color: '#586069' }}>{repository.description}</p>
      )}
      <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem', color: '#586069' }}>
        {repository.language && (
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#f1e05a', marginRight: 6 }} />
            {repository.language}
          </span>
        )}
        <span>⭐ {repository.stars ?? 0} Stars</span>
        <span>🍴 {repository.forks ?? 0} Forks</span>
        <span>👁️ {repository.watchers ?? 0} Watchers</span>
        {repository.updatedAt && (
          <span>Updated on {new Date(repository.updatedAt).toLocaleDateString()}</span>
        )}
      </div>
    </section>
  );
};

export default RepositoryOverview;