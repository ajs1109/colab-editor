import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRepositoryFiles } from '@/lib/apiClient';
import FileExplorer from '@/components/FileExplorer';

const CodePage = () => {
  const { repoId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFiles = async () => {
      try {
        const data = await fetchRepositoryFiles(repoId);
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getFiles();
  }, [repoId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Code</h1>
      <FileExplorer files={files} />
    </div>
  );
};

export default CodePage;