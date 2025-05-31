import { useEffect, useState } from 'react';
//import { fetchRepositoryData } from '@/lib/apiClient';

const useRepository = (repoId) => {
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRepositoryData = async () => {
      try {
        setLoading(true);
        const data = null;//await fetchRepositoryData(repoId);
        setRepository(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (repoId) {
      getRepositoryData();
    }
  }, [repoId]);

  return { repository, loading, error };
};

export default useRepository;