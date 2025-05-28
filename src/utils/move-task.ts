const calculateNewPosition = (before: number, after: number): number => {
  return Math.floor((before + after) / 2);
};

export const canMoveTask = (
  overTask: ITaskWithOptions,
  activeTask: ITaskWithOptions
): boolean => {
  // non priority task is moved on top of priority task or priority task is moved below a non priority task, don't allow it
  if (
    (overTask.priority && !activeTask.priority) ||
    (!overTask.priority && activeTask.priority)
  ) {
    return false;
  }

  // if moving a task with higher priority below a task with lower priority, don't allow it
  if (
    (overTask.priority?.order as number) >
    (activeTask.priority?.order as number)
  ) {
    return false;
  }

  // allow it otherwise
  return true;
};

export const moveTaskUp = (
  overIndex: number,
  overTaskId: string,
  overColumnId: string,
  tasks: ITaskWithOptions[]
) => {
  const columnTasks = tasks.filter((task) => task.status_id === overColumnId);

  const topTaskIndex = overIndex - 1;

  if (topTaskIndex < 0) {
    const overTask = tasks.find((task) => task.id === overTaskId);
    const newPosition = overTask ? (overTask.statusPosition ?? 0) + 100 : 10000;
    return newPosition;
  }

  const topTaskId = columnTasks[topTaskIndex]?.id;
  if (topTaskId && overTaskId) {
    const topTask = tasks.find((task) => task.id === topTaskId);
    const overTask = tasks.find((task) => task.id === overTaskId);

    return calculateNewPosition(
      topTask?.statusPosition ?? 0,
      overTask?.statusPosition ?? 0
    );
  }
};

export const moveTaskDown = (
  overIndex: number,
  overTaskId: string,
  overColumnId: string,
  tasks: ITaskWithOptions[]
) => {
  const columnTasks = tasks.filter((task) => task.status_id === overColumnId);

  const bottomTaskIndex = overIndex + 1;

  if (bottomTaskIndex >= columnTasks.length) {
    const overTask = tasks.find((task) => task.id === overTaskId);
    return overTask ? (overTask.statusPosition ?? 0) - 10 : 500;
  }

  const bottomTaskId = columnTasks[bottomTaskIndex]?.id;
  if (bottomTaskId && overTaskId) {
    const bottomTask = tasks.find((task) => task.id === bottomTaskId);
    const overTask = tasks.find((task) => task.id === overTaskId);

    return calculateNewPosition(
      bottomTask?.statusPosition ?? 0,
      overTask?.statusPosition ?? 0
    );
  }
};
