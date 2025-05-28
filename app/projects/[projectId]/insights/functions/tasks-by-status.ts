interface ITasksByStatus {
  name: string;
  count: number;
}
export function getTasksByStatus(
  tasks: ITask[],
  statuses: IStatus[]
): ITasksByStatus[] {
  const statusMap = new Map<string, number>();

  statuses.forEach((status) => statusMap.set(status.id, 0));

  tasks.forEach((task) => {
    if (statusMap.has(task.status_id)) {
      statusMap.set(task.status_id, (statusMap.get(task.status_id) || 0) + 1);
    }
  });

  return statuses.map((status) => ({
    name: status.label,
    count: statusMap.get(status.id) || 0,
  }));
}
