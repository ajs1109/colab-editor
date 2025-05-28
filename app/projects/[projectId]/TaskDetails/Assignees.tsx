'use client';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useTaskQueries } from '@/hooks/useTaskQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useParams } from 'next/navigation';
import { UserCard } from '@/components/UserCard';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useProjectOwner } from '@/hooks/useProjectOwner';

export const Assignees = () => {
  const params = useParams();
  const { selectedTask } = useTaskDetails();
  const { members, reloadProjectTasks } = useProjectQueries(
    params.projectId as string
  );
  const { task, updateAssignees } = useTaskQueries(selectedTask?.id || '');
  const { createActivities } = useActivityQueries(selectedTask?.id || '');
  const { user } = useCurrentUser();
  const { owner } = useProjectOwner(params.projectId as string);

  const [filter, setFilter] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize selected assignees when task loads or changes
  useEffect(() => {
    if (task?.assignees) {
      setSelectedAssignees(task.assignees.map((a) => a.id));
    }
  }, [task?.assignees]);

  // Combine project members with owner if not already included
  const allMembers = useMemo(() => {
    if (!members || !owner) return members ?? [];
    const isOwnerInMembers = members.some((m) => m.id === owner.id);
    if (isOwnerInMembers) return members;

    return [
      {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        avatar: owner.avatar,
        description: owner.description,
        links: owner.links,
      },
      ...members,
    ];
  }, [members, owner]);

  const handleAssigneeToggle = (userId: string) => {
    setSelectedAssignees((prev) => {
      const isCurrentlySelected = prev.includes(userId);
      return isCurrentlySelected
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
    });
  };

  const handlePopoverOpenChange = async (open: boolean) => {
    if (
      !open &&
      JSON.stringify(selectedAssignees.sort()) !==
        JSON.stringify(task?.assignees?.map((a) => a.id).sort())
    ) {
      const currentAssignees = task?.assignees?.map((a) => a.id) || [];
      const newAssignees = selectedAssignees;

      // Find added and removed assignees
      const addedAssignees = newAssignees.filter(
        (id) => !currentAssignees.includes(id)
      );
      const removedAssignees = currentAssignees.filter(
        (id) => !newAssignees.includes(id)
      );

      // Update the assignees first
      await updateAssignees(selectedAssignees);
      await reloadProjectTasks();

      // Create activities for both additions and removals
      const activities: {
        task_id: string;
        user_id: string;
        content: TaskActivity;
      }[] = [];

      // Handle added assignees
      if (addedAssignees.length > 0) {
        // Check if it's a self-assignment
        if (addedAssignees.length === 1 && addedAssignees[0] === user?.id) {
          activities.push({
            task_id: selectedTask?.id as string,
            user_id: user?.id as string,
            content: [
              {
                type: 'user',
                id: user?.id as string,
              },
              'self-assigned this on',
              { type: 'date', value: new Date().toISOString() },
            ],
          });
        } else {
          activities.push({
            task_id: selectedTask?.id as string,
            user_id: user?.id as string,
            content: [
              {
                type: 'user',
                id: user?.id as string,
              },
              'assigned',
              { type: 'users', ids: addedAssignees },
              'to this on',
              { type: 'date', value: new Date().toISOString() },
            ],
          });
        }
      }

      // Handle removed assignees
      if (removedAssignees.length > 0) {
        // Check if it's a self-unassignment
        if (removedAssignees.length === 1 && removedAssignees[0] === user?.id) {
          activities.push({
            task_id: selectedTask?.id as string,
            user_id: user?.id as string,
            content: [
              {
                type: 'user',
                id: user?.id as string,
              },
              'removed themselves from this task on',
              { type: 'date', value: new Date().toISOString() },
            ],
          });
        } else {
          activities.push({
            task_id: selectedTask?.id as string,
            user_id: user?.id as string,
            content: [
              {
                type: 'user',
                id: user?.id as string,
              },
              'unassigned',
              { type: 'users', ids: removedAssignees },
              'from this task on',
              { type: 'date', value: new Date().toISOString() },
            ],
          });
        }
      }

      if (activities.length > 0) {
        await createActivities(activities);
      }
    }
    setIsOpen(open);
  };

  const handleAssignSelf = async () => {
    if (user?.id) {
      await updateAssignees([user.id]);
      await reloadProjectTasks();

      // Create self-assignment activity
      await createActivities([
        {
          task_id: selectedTask?.id as string,
          user_id: user.id,
          content: [
            {
              type: 'user',
              id: user.id,
            },
            'self-assigned this on',
            { type: 'date', value: new Date().toISOString() },
          ],
        },
      ]);

      setSelectedAssignees([user.id]);
    }
  };

  const filteredMembers = allMembers?.filter((member) =>
    member.name?.toLowerCase().includes(filter.toLowerCase())
  );

  const isAssigned = (userId: string) => selectedAssignees.includes(userId);

  return (
    <>
      <div className="flex justify-between items-center text-gray-500">
        <span className="text-xs">Assignees</span>
        <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger>
            <Settings className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent className="mr-4">
            <Label className="mb-2 text-xs">Assign people to this task</Label>
            <Input
              placeholder="filter assignees"
              className="h-7 my-1 rounded-sm bg-gray-100 dark:bg-black"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Separator className="my-2" />
            {filteredMembers?.map((member) => (
              <div
                key={member.id}
                className="flex items-center hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 p-1 text-xs"
                onClick={() => handleAssigneeToggle(member.id || '')}
              >
                <Checkbox
                  checked={isAssigned(member.id || '')}
                  className="w-4 h-4 mr-4 rounded-sm bg-gray-200 dark:bg-black border border-gray-300 dark:border-gray-900"
                />
                <Avatar className="w-4 h-4 mr-2">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <span>{member.name}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-xs pt-2 pb-4">
        {task?.assignees && task.assignees.length > 0 ? (
          <div className="flex flex-col gap-2">
            {task.assignees.map((assignee) => (
              <UserCard
                key={assignee.id}
                id={assignee.id}
                name={assignee.name}
                avatarUrl={assignee.avatar}
                description={assignee.description}
                links={assignee.links}
              />
            ))}
          </div>
        ) : (
          <>
            No one -
            <Button
              onClick={handleAssignSelf}
              className="px-1 text-blue-500 bg-transparent text-xs h-4 font-normal hover:bg-transparent"
            >
              Assign yourself
            </Button>
          </>
        )}
      </div>
    </>
  );
};
