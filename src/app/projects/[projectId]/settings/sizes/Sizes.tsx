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

export const Sizes = ({ projectId, items: initialItems }: Props) => {
  const { reloadSizes, reloadProjectTasks } = useProjectQueries(projectId);
  const [items, setItems] = useState(initialItems);
  const [sizes, setSizes] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const hasUnsavedChanges = hasChanges(items, sizes);

  const handleSaveData = async () => {
    try {
      setIsSaving(true);

      const { itemsToAdd, itemsToUpdate, itemsToDelete } =
        compareAndUpdateItems(items, sizes);

      await Promise.all([
        // Delete items
        itemsToDelete.length > 0 &&
          supabase.from('sizes').delete().in('id', itemsToDelete),

        // Update items
        itemsToUpdate.length > 0 &&
          supabase.from('sizes').upsert(
            itemsToUpdate.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),

        // Add new items
        itemsToAdd.length > 0 &&
          supabase.from('sizes').insert(
            itemsToAdd.map((item) => ({
              ...item,
              project_id: projectId,
              updated_at: new Date(),
            }))
          ),
      ]);

      setItems(sizes);

      toast({
        title: 'Success',
        description: 'Sizes updated successfully',
      });
      await reloadSizes();
      await reloadProjectTasks();
    } catch (error) {
      console.error('Error saving sizes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save sizes',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <CreateCustomFieldOptionModal
          title="Create new size"
          triggerLabel="Create new size option"
          handleSubmit={(data) =>
            setSizes((items) => [
              ...items,
              { id: crypto.randomUUID(), order: items.length, ...data },
            ])
          }
        />
      </div>

      <CustomFieldOptions field="size" options={sizes} setOptions={setSizes} />

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
