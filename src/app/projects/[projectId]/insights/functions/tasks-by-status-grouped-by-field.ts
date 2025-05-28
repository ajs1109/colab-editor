interface IStatusGroupedByField {
  name: string;
  [field: string]: number | string;
}

function getTasksByStatusGroupedByField<T extends IField>(
  tasks: ITask[],
  statuses: IStatus[],
  fields: T[],
  fieldKey: keyof ITask,
  noFieldLabel: string
): IStatusGroupedByField[] {
  const statusMap = new Map<string, IStatusGroupedByField>();

  // Initialize status map with fields
  statuses.forEach((status) => {
    const fieldCounts: { [field: string]: number } = {};
    fields.forEach((field) => {
      fieldCounts[field.label] = 0;
    });
    fieldCounts[noFieldLabel] = 0;

    statusMap.set(status.id, { name: status.label, ...fieldCounts });
  });

  // Count tasks based on status and fields
  tasks.forEach((task) => {
    const statusEntry = statusMap.get(task.status_id);
    if (statusEntry) {
      const taskField = task[fieldKey] as unknown as string[];
      if (!taskField || (Array.isArray(taskField) && taskField.length === 0)) {
        (statusEntry[noFieldLabel] as number) += 1;
      } else {
        if (Array.isArray(taskField)) {
          taskField.forEach((fieldId) => {
            const field = fields.find((f) => f.id === fieldId);
            if (field) {
              (statusEntry[field.label] as number) += 1;
            }
          });
        } else {
          const field = fields.find((f) => f.id === taskField);
          if (field) {
            (statusEntry[field.label] as number) += 1;
          }
        }
      }
    }
  });

  // Convert status map to array
  const result: IStatusGroupedByField[] = [];
  statusMap.forEach((value) => {
    // Ensure the noFieldLabel is the last item
    const { [noFieldLabel]: noField, ...rest } = value;
    result.push({ ...rest, [noFieldLabel]: noField } as IStatusGroupedByField);
  });

  return result;
}

export function getTasksByStatusGroupedByLabels(
  tasks: ITask[],
  statuses: IStatus[],
  labels: ILabel[]
): IStatusGroupedByField[] {
  return getTasksByStatusGroupedByField(
    tasks,
    statuses,
    labels,
    'labels',
    'No label'
  );
}

export function getTasksByStatusGroupedBySize(
  tasks: ITask[],
  statuses: IStatus[],
  sizes: ISize[]
): IStatusGroupedByField[] {
  return getTasksByStatusGroupedByField(
    tasks,
    statuses,
    sizes,
    'size',
    'No size'
  );
}

export function getTasksByStatusGroupedByPriority(
  tasks: ITask[],
  statuses: IStatus[],
  priorities: IPriority[]
): IStatusGroupedByField[] {
  return getTasksByStatusGroupedByField(
    tasks,
    statuses,
    priorities,
    'priority',
    'No priority'
  );
}
