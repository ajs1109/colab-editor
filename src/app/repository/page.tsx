"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RepositoryOverview from '../components/RepositoryOverview';
import useRepository  from '../hooks/useRepository';

const RepositoryPage = () => {
  const searchParams = useSearchParams()
 
  const repoId = searchParams.get('repoId')
  const { repository, loading, error } = useRepository(repoId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading repository</div>;

  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <RepositoryOverview repository={repository} />
      </main>
    </div>
  );
};

export default RepositoryPage;