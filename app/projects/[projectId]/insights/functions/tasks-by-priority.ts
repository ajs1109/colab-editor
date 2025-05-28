interface ITasksByPriority {
  name: string;
  count: number;
}

export function getTasksByPriority(
  tasks: ITask[],
  priorities: IPriority[]
): ITasksByPriority[] {
  const priorityMap = new Map<string, number>();

  priorities.forEach((priority) => priorityMap.set(priority.id, 0));

  tasks.forEach((task) => {
    if (priorityMap.has(task.priority as string)) {
      priorityMap.set(
        task.priority as string,
        (priorityMap.get(task.priority as string) || 0) + 1
      );
    }
  });

  return priorities.map((priority) => ({
    name: priority.label,
    count: priorityMap.get(priority.id) || 0,
  }));
}
