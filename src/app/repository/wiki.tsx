import React from 'react';
import { useParams } from 'react-router-dom';
import MarkdownViewer from '@/components/MarkdownViewer';
import WikiEditor from '@/components/WikiEditor';
import { useWiki } from '@/hooks/useRepository';

const WikiPage = () => {
  const { projectId } = useParams();
  const { wikiContent, isEditing, toggleEdit, saveWiki } = useWiki(projectId);

  return (
    <div>
      <h1>Wiki</h1>
      {isEditing ? (
        <WikiEditor content={wikiContent} onSave={saveWiki} onCancel={toggleEdit} />
      ) : (
        <>
          <MarkdownViewer content={wikiContent} />
          <button onClick={toggleEdit}>Edit</button>
        </>
      )}
    </div>
  );
};

export default WikiPage;