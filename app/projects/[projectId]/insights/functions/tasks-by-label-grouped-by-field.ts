interface ILabelGroupedByField {
  name: string;
  [field: string]: number | string;
}

function getTasksByLabelGroupedByField<T extends IField>(
  tasks: ITask[],
  labels: ILabel[],
  fields: T[],
  fieldKey: keyof ITask,
  noFieldLabel: string
): ILabelGroupedByField[] {
  const labelMap = new Map<string, ILabelGroupedByField>();

  // Initialize label map with fields
  labels.forEach((label) => {
    const fieldCounts: { [field: string]: number } = {};
    fields.forEach((field) => {
      fieldCounts[field.label] = 0;
    });
    fieldCounts[noFieldLabel] = 0;

    labelMap.set(label.id, { name: label.label, ...fieldCounts });
  });

  // Count tasks based on labels and fields
  tasks.forEach((task) => {
    if (task.labels.length === 0) {
      // Handle tasks with no labels
      const noLabelEntry = labelMap.get('No label');
      if (!noLabelEntry) {
        const fieldCounts: { [field: string]: number } = {};
        fields.forEach((field) => {
          fieldCounts[field.label] = 0;
        });
        fieldCounts[noFieldLabel] = 1;
        labelMap.set('No label', { name: 'No label', ...fieldCounts });
      } else {
        (noLabelEntry[noFieldLabel] as number) += 1;
      }
    } else {
      // Handle tasks with labels
      task.labels.forEach((labelId) => {
        const labelEntry = labelMap.get(labelId);
        if (labelEntry) {
          const taskField = task[fieldKey] as unknown as string;
          if (!taskField) {
            (labelEntry[noFieldLabel] as number) += 1;
          } else {
            const field = fields.find((f) => f.id === taskField);
            if (field) {
              (labelEntry[field.label] as number) += 1;
            }
          }
        }
      });
    }
  });

  // Convert label map to array
  const result: ILabelGroupedByField[] = [];
  labelMap.forEach((value) => {
    // Ensure the noFieldLabel is the last item
    const { [noFieldLabel]: noField, ...rest } = value;
    result.push({ ...rest, [noFieldLabel]: noField } as ILabelGroupedByField);
  });

  return result;
}

export function getTasksByLabelsGroupedByStatus(
  tasks: ITask[],
  labels: ILabel[],
  statuses: IStatus[]
): ILabelGroupedByField[] {
  return getTasksByLabelGroupedByField(
    tasks,
    labels,
    statuses,
    'status_id',
    'No status'
  );
}

export function getTasksByLabelsGroupedBySize(
  tasks: ITask[],
  labels: ILabel[],
  sizes: ISize[]
): ILabelGroupedByField[] {
  return getTasksByLabelGroupedByField(tasks, labels, sizes, 'size', 'No size');
}

export function getTasksByLabelsGroupedByPriority(
  tasks: ITask[],
  labels: ILabel[],
  priorities: IPriority[]
): ILabelGroupedByField[] {
  return getTasksByLabelGroupedByField(
    tasks,
    labels,
    priorities,
    'priority',
    'No priority'
  );
}
