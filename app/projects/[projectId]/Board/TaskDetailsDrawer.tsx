import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TaskDetails } from '../TaskDetails';
import { HeaderSection } from '../TaskDetails/HeaderSection';
import { useTaskDetails } from './TaskDetailsContext';

export const TaskDetailsDrawer = () => {
  const {
    selectedTask,
    projectName,
    isDrawerOpen,
    closeDrawer,
    updateTaskTitle,
  } = useTaskDetails();

  if (!selectedTask) return null;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="min-w-full sm:min-w-[550px] md:min-w-[750px] lg:min-w-[70%] dark:bg-gray-950 overflow-y-auto">
        <SheetHeader className="py-4">
          <SheetTitle className="flex items-center justify-between py-2">
            <HeaderSection
              title={selectedTask.title || ''}
              taskId={selectedTask.id || ''}
              onTitleUpdate={
                updateTaskTitle
                  ? (newTitle: string) =>
                      updateTaskTitle(selectedTask.id || '', newTitle)
                  : undefined
              }
            />
          </SheetTitle>
          <SheetDescription className="text-left" asChild>
            <Badge
              variant="outline"
              className="text-[11px] text-gray-500 dark:text-gray-600 w-fit"
            >
              {projectName}
            </Badge>
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <TaskDetails />
      </SheetContent>
    </Sheet>
  );
};
