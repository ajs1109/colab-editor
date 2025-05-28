'use client';
import { LabelBadge } from '@/components/LabelBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useTaskQueries } from '@/hooks/useTaskQueries';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTaskDetails } from '../Board/TaskDetailsContext';

export const TaskLabels = () => {
  const params = useParams();
  const { selectedTask, updateTaskLabels } = useTaskDetails();
  const { labels } = useProjectQueries(params.projectId as string);
  const { task, updateLabels } = useTaskQueries(selectedTask?.id || '');
  const { createActivities } = useActivityQueries(selectedTask?.id || '');
  const { user } = useCurrentUser();
  const [filter, setFilter] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize selected labels when task loads or changes
  useEffect(() => {
    if (task?.labels) {
      setSelectedLabels(task.labels.map((label) => label.id));
      updateTaskLabels?.(selectedTask?.id || '', task?.labels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.labels]);

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels((prev) => {
      const isCurrentlySelected = prev.includes(labelId);
      return isCurrentlySelected
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId];
    });
  };

  const handlePopoverOpenChange = async (open: boolean) => {
    if (
      !open &&
      JSON.stringify(selectedLabels.sort()) !==
        JSON.stringify(task?.labels?.map((label) => label.id).sort())
    ) {
      const currentLabels = task?.labels?.map((label) => label.id) || [];
      const newLabels = selectedLabels;

      // Find added and removed labels
      const addedLabels = newLabels.filter((id) => !currentLabels.includes(id));
      const removedLabels = currentLabels.filter(
        (id) => !newLabels.includes(id)
      );

      // Update the labels first
      await updateLabels(selectedLabels);

      // Create activities for both additions and removals
      const activities: {
        task_id: string;
        user_id: string;
        content: TaskActivity;
      }[] = [];

      if (addedLabels.length > 0) {
        activities.push({
          task_id: selectedTask?.id as string,
          user_id: user?.id as string,
          content: [
            {
              type: 'user',
              id: user?.id as string,
            },
            'added',
            { type: 'labels', ids: addedLabels },
            'on',
            { type: 'date', value: new Date().toISOString() },
          ],
        });
      }

      if (removedLabels.length > 0) {
        activities.push({
          task_id: selectedTask?.id as string,
          user_id: user?.id as string,
          content: [
            {
              type: 'user',
              id: user?.id as string,
            },
            'removed',
            { type: 'labels', ids: removedLabels },
            'on',
            { type: 'date', value: new Date().toISOString() },
          ],
        });
      }

      if (activities.length > 0) {
        await createActivities(activities);
      }
    }
    setIsOpen(open);
  };

  const filteredLabels = labels?.filter((label) =>
    label.label.toLowerCase().includes(filter.toLowerCase())
  );

  const isSelected = (labelId: string) => selectedLabels.includes(labelId);

  return (
    <>
      <div className="flex justify-between items-center text-gray-500 pt-4">
        <span className="text-xs">Labels</span>
        <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger>
            <Settings className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent className="mr-4">
            <Label className="mb-2 text-xs">Apply labels to this task</Label>
            <Input
              placeholder="filter labels"
              className="h-7 my-1 rounded-sm bg-gray-100 dark:bg-black"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Separator className="my-2" />
            <ScrollArea className="h-[200px]">
              {filteredLabels?.map((label) => (
                <div
                  key={label.id}
                  className="flex items-start hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 p-1 text-xs"
                  onClick={() => handleLabelToggle(label.id)}
                >
                  <Checkbox
                    checked={isSelected(label.id)}
                    className="w-4 h-4 mr-4 rounded-sm bg-gray-200 dark:bg-black border border-gray-300 dark:border-gray-900"
                  />
                  <div className="flex items-start">
                    <div
                      className="w-3 h-3 mr-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <div>
                      <div>{label.label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        {label.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <Separator className="my-1" />
            <Link href={`/projects/${params.projectId}/settings/labels`}>
              <Button variant="ghost" className="w-full h-7 text-xs">
                Edit labels
              </Button>
            </Link>
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-xs pt-2 pb-4 space-x-1">
        {task?.labels && task.labels.length > 0 ? (
          task.labels.map((label) => (
            <LabelBadge
              key={label.id}
              color={label.color}
              labelText={label.label}
            />
          ))
        ) : (
          <span className="text-gray-500">None yet</span>
        )}
      </div>
    </>
  );
};
