interface ITasksByLabel {
  name: string;
  count: number;
}

export function getTasksByLabel(
  tasks: ITask[],
  labels: ILabel[]
): ITasksByLabel[] {
  const labelMap = new Map<string, number>();

  labels.forEach((label) => labelMap.set(label.id, 0));

  tasks.forEach((task) => {
    task.labels?.forEach((labelId) => {
      if (labelMap.has(labelId)) {
        labelMap.set(labelId, (labelMap.get(labelId) || 0) + 1);
      }
    });
  });

  return labels.map((label) => ({
    name: label.label,
    count: labelMap.get(label.id) || 0,
  }));
}
