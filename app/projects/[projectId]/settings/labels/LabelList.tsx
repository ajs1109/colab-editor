'use client';
import { secondaryBtnStyles } from '@/app/commonStyles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Ellipsis } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LabelBadge } from '@/components/LabelBadge';
import { useParams, useSearchParams } from 'next/navigation';
import { defaultFieldColor } from '@/consts/colors';
import { CreateOrEditLabelForm } from '@/components/CreateOrEditLabelForm';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useProjectQueries } from '@/hooks/useProjectQueries';

interface Props {
  labels: ICustomFieldData[];
  hiddenDescription?: boolean;
  onLabelUpdated?: (label: ICustomFieldData) => void;
  onLabelDeleted?: (labelId: string) => void;
}

export const LabelList = ({
  labels,
  hiddenDescription = false,
  onLabelUpdated,
  onLabelDeleted,
}: Props) => {
  const { projectId } = useParams();
  const { reloadLabels, reloadProjectTasks } = useProjectQueries(
    projectId as string
  );
  const [labelId, setLabelId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const labelIdParams = searchParams.get('label_id');
    if (labelIdParams) {
      setLabelId(labelIdParams);
    }
  }, [searchParams]);

  const handleUpdateLabel = async (data: ICustomFieldData) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('labels')
        .update({
          ...data,
          updated_at: new Date(),
        })
        .eq('id', data.id);

      if (error) throw error;

      onLabelUpdated?.(data);
      toast({
        title: 'Success',
        description: 'Label updated successfully',
      });
      setLabelId('');
      await reloadLabels();
      await reloadProjectTasks();
    } catch (error) {
      console.error('Error updating label:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update label',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      const { error } = await supabase.from('labels').delete().eq('id', id);

      if (error) throw error;

      onLabelDeleted?.(id);
      toast({
        title: 'Success',
        description: 'Label deleted successfully',
      });
      await reloadLabels();
      await reloadProjectTasks();
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete label',
      });
    }
  };

  return (
    <div className="w-full rounded-md shadow-md">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {labels.map((label) => (
            <React.Fragment key={label.id}>
              <tr>
                <td className="p-4 whitespace-nowrap">
                  <LabelBadge
                    labelText={label.label || ''}
                    description={label.description || ''}
                    color={label.color || defaultFieldColor}
                  />
                </td>
                {!hiddenDescription && (
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400 truncate hidden md:block">
                    {label.description}
                  </td>
                )}
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block text-left">
                    <div className="space-x-1 hidden lg:flex">
                      <Button
                        className={cn(
                          secondaryBtnStyles,
                          'text-xs h-8 rounded-sm'
                        )}
                        onClick={() => setLabelId(label.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        className={cn(
                          secondaryBtnStyles,
                          'text-xs text-red-600 dark:text-red-300 h-8 rounded-sm'
                        )}
                        onClick={() => handleDeleteLabel(label.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="lg:hidden">
                        <Ellipsis />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setLabelId(label.id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteLabel(label.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
              {labelId === label.id && (
                <tr>
                  <td colSpan={4} className="p-4">
                    <CreateOrEditLabelForm
                      mode="edit"
                      cancel={() => setLabelId('')}
                      save={handleUpdateLabel}
                      data={label}
                      isSubmitting={isUpdating}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
