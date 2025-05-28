export const sortTasks = (tasks: ITaskWithOptions[]): ITaskWithOptions[] => {
  // Split tasks into priority and non-priority groups
  const priorityTasks = tasks.filter(
    (task) => task.priority?.order !== undefined
  );
  const nonPriorityTasks = tasks.filter(
    (task) => task.priority?.order === undefined
  );

  // Sort priority tasks by order first, then by statusPosition if orders are equal
  const sortedPriorityTasks = priorityTasks.sort((a, b) => {
    if (a.priority!.order !== b.priority!.order) {
      return b.priority!.order - a.priority!.order;
    }
    return (b.statusPosition ?? 0) - (a.statusPosition ?? 0);
  });

  // Sort non-priority tasks by statusPosition
  const sortedNonPriorityTasks = nonPriorityTasks.sort(
    (a, b) => (b.statusPosition ?? 0) - (a.statusPosition ?? 0)
  );

  // Merge priority tasks followed by non-priority tasks
  return [...sortedPriorityTasks, ...sortedNonPriorityTasks];
};

export const getColumnSortedTasks = (
  tasks: ITaskWithOptions[],
  statusId: string
) => {
  const filteredTasks = tasks.filter((task) => task.status_id === statusId);
  return sortTasks(filteredTasks);
};

export const getLowestColumnPosition = (tasks: ITaskWithOptions[]) => {
  if (tasks.length === 0) return 10000;

  const sortedTasks = sortTasks(tasks);

  const lowestPosition =
    sortedTasks[sortedTasks.length - 1]?.statusPosition ?? 0;
  return lowestPosition < 1
    ? lowestPosition - 0.1
    : lowestPosition < 10
      ? lowestPosition - 1
      : lowestPosition < 100
        ? lowestPosition - 10
        : lowestPosition - 100;
};
