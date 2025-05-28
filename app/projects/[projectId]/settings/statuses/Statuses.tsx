'use client';
import { primaryBtnStyles } from '@/app/commonStyles';
import { CreateCustomFieldOptionModal } from '@/components/CreateCustomFieldOptionModal';
import { CustomFieldOptions } from '@/components/CustomFieldOptions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { compareAndUpdateItems, hasChanges } from '@/utils/array-utils';
import { useState } from 'react';
import { useProjectQueries } from '@/hooks/useProjectQueries';

interface Props {
  projectId: string;
  items: ICustomFieldData[];
}

export const Statuses = ({ projectId, items: initialItems }: Props) => {
  const { reloadStatuses, reloadProjectTasks } = useProjectQueries(projectId);
  const [items, setItems] = useState(initialItems);
  const [statuses, setStatuses] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const hasUnsavedChanges = hasChanges(items, statuses);

  const handleSaveData = async () => {
    try {
      setIsSaving(true);

      const { itemsToAdd, itemsToUpdate, itemsToDelete } =
        compareAndUpdateItems(items, statuses);

      await Promise.all([
        // Delete items
        itemsToDelete.length > 0 &&
          supabase.from('statuses').delete().in('id', itemsToDelete),

        // Update items
        itemsToUpdate.length > 0 &&
          supabase.from('statuses').upsert(
            itemsToUpdate.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),

        // Add new items
        itemsToAdd.length > 0 &&
          supabase.from('statuses').insert(
            itemsToAdd.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),
      ]);

      setItems(statuses);

      toast({
        title: 'Success',
        description: 'Statuses updated successfully',
      });
      await reloadStatuses();
      await reloadProjectTasks();
    } catch (error) {
      console.error('Error saving statuses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save statuses',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <CreateCustomFieldOptionModal
          title="Create new status"
          triggerLabel="Create new status option"
          handleSubmit={(data) =>
            setStatuses((items) => [
              ...items,
              { id: crypto.randomUUID(), order: items.length, ...data },
            ])
          }
        />
      </div>

      <CustomFieldOptions
        field="status"
        options={statuses}
        setOptions={setStatuses}
      />

      <div className="flex flex-col gap-2  items-end py-4">
        {hasUnsavedChanges && (
          <span className="text-sm text-center text-green-500 w-32">
            unsaved
          </span>
        )}

        <Button
          onClick={handleSaveData}
          className={cn(primaryBtnStyles)}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};
