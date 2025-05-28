'use client';
import { primaryBtnStyles } from '@/app/commonStyles';
import { CreateCustomFieldOptionModal } from '@/components/CreateCustomFieldOptionModal';
import { CustomFieldOptions } from '@/components/CustomFieldOptions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { cn } from '@/lib/utils';
import { compareAndUpdateItems, hasChanges } from '@/utils/array-utils';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

interface Props {
  projectId: string;
  items: ICustomFieldData[];
}

export const Priorities = ({ projectId, items: initialItems }: Props) => {
  const { reloadPriorities, reloadProjectTasks } = useProjectQueries(projectId);
  const [items, setItems] = useState(initialItems);
  const [priorities, setPriorities] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const hasUnsavedChanges = hasChanges(items, priorities);

  const handleSaveData = async () => {
    try {
      setIsSaving(true);

      const { itemsToAdd, itemsToUpdate, itemsToDelete } =
        compareAndUpdateItems(items, priorities);

      // Perform database operations in parallel
      await Promise.all([
        // Delete items
        itemsToDelete.length > 0 &&
          supabase.from('priorities').delete().in('id', itemsToDelete),

        // Update items
        itemsToUpdate.length > 0 &&
          supabase.from('priorities').upsert(
            itemsToUpdate.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),

        // Add new items
        itemsToAdd.length > 0 &&
          supabase.from('priorities').insert(
            itemsToAdd.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),
      ]);

      setItems(priorities);

      toast({
        title: 'Success',
        description: 'Priorities updated successfully',
      });
      await reloadPriorities();
      await reloadProjectTasks();
    } catch (error) {
      console.error('Error saving priorities:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save priorities',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <CreateCustomFieldOptionModal
          title="Create new priority"
          triggerLabel="Create new priority option"
          handleSubmit={(data) =>
            setPriorities((items) => [
              ...items,
              { id: crypto.randomUUID(), order: items.length, ...data },
            ])
          }
        />
      </div>

      <CustomFieldOptions
        field="priority"
        options={priorities}
        setOptions={setPriorities}
        description="Priorities are ordered from lowest (top) to highest (bottom). The last item in the list has the highest priority."
      />

      <div className="flex flex-col gap-2 items-end py-4">
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
