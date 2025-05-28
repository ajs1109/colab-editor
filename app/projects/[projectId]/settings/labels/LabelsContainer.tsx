'use client';

import { CreateNewLabel } from './CreateNewLabel';
import { LabelList } from './LabelList';
import { useState } from 'react';

interface Props {
  projectId: string;
  initialLabels: ICustomFieldData[];
}

export const LabelsContainer = ({ projectId, initialLabels }: Props) => {
  const [labels, setLabels] = useState(initialLabels);

  const handleLabelCreated = (newLabel: ICustomFieldData) => {
    setLabels((prev) => [...prev, newLabel]);
  };

  const handleLabelUpdated = (updatedLabel: ICustomFieldData) => {
    setLabels((prev) =>
      prev.map((label) => (label.id === updatedLabel.id ? updatedLabel : label))
    );
  };

  const handleLabelDeleted = (labelId: string) => {
    setLabels((prev) => prev.filter((label) => label.id !== labelId));
  };

  return (
    <>
      <CreateNewLabel
        projectId={projectId}
        onLabelCreated={handleLabelCreated}
      />

      <div className="rounded-md border overflow-hidden">
        <div className="bg-muted dark:bg-muted/20 flex justify-between items-center px-4 py-4 border-b">
          <div>
            <span className="text-xs">{labels.length} labels</span>
          </div>
        </div>
        <LabelList
          labels={labels}
          onLabelUpdated={handleLabelUpdated}
          onLabelDeleted={handleLabelDeleted}
        />
      </div>
    </>
  );
};
