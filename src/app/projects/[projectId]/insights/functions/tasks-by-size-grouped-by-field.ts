interface ISizeGroupedByField {
  name: string;
  [field: string]: number | string;
}

function getTasksBySizeGroupedByField<T extends IField>(
  tasks: ITask[],
  sizes: ISize[],
  fields: T[],
  fieldKey: keyof ITask,
  noFieldLabel: string
): ISizeGroupedByField[] {
  const sizeMap = new Map<string, ISizeGroupedByField>();

  // Initialize size map with fields
  sizes.forEach((size) => {
    const fieldCounts: { [field: string]: number } = {};
    fields.forEach((field) => {
      fieldCounts[field.label] = 0;
    });
    fieldCounts[noFieldLabel] = 0;

    sizeMap.set(size.id, { name: size.label, ...fieldCounts });
  });

  // Count tasks based on sizes and fields
  tasks.forEach((task) => {
    const sizeEntry = sizeMap.get(task.size as string);
    if (sizeEntry) {
      const taskField = task[fieldKey] as unknown as string[];
      if (!taskField || (Array.isArray(taskField) && taskField.length === 0)) {
        (sizeEntry[noFieldLabel] as number) += 1;
      } else {
        if (Array.isArray(taskField)) {
          taskField.forEach((fieldId) => {
            const field = fields.find((f) => f.id === fieldId);
            if (field) {
              (sizeEntry[field.label] as number) += 1;
            }
          });
        } else {
          const field = fields.find((f) => f.id === taskField);
          if (field) {
            (sizeEntry[field.label] as number) += 1;
          }
        }
      }
    } else {
      // Handle tasks with no size
      const noSizeEntry = sizeMap.get('No size');
      if (!noSizeEntry) {
        const fieldCounts: { [field: string]: number } = {};
        fields.forEach((field) => {
          fieldCounts[field.label] = 0;
        });
        fieldCounts[noFieldLabel] = 1;
        sizeMap.set('No size', { name: 'No size', ...fieldCounts });
      } else {
        (noSizeEntry[noFieldLabel] as number) += 1;
      }
    }
  });

  // Convert size map to array
  const result: ISizeGroupedByField[] = [];
  sizeMap.forEach((value) => {
    // Ensure the noFieldLabel is the last item
    const { [noFieldLabel]: noField, ...rest } = value;
    result.push({ ...rest, [noFieldLabel]: noField } as ISizeGroupedByField);
  });

  return result;
}

export function getTasksBySizeGroupedByStatus(
  tasks: ITask[],
  sizes: ISize[],
  statuses: IStatus[]
): ISizeGroupedByField[] {
  return getTasksBySizeGroupedByField(
    tasks,
    sizes,
    statuses,
    'status_id',
    'No status'
  );
}

export function getTasksBySizeGroupedByLabels(
  tasks: ITask[],
  sizes: ISize[],
  labels: ILabel[]
): ISizeGroupedByField[] {
  return getTasksBySizeGroupedByField(
    tasks,
    sizes,
    labels,
    'labels',
    'No label'
  );
}

export function getTasksBySizeGroupedByPriority(
  tasks: ITask[],
  sizes: ISize[],
  priorities: IPriority[]
): ISizeGroupedByField[] {
  return getTasksBySizeGroupedByField(
    tasks,
    sizes,
    priorities,
    'priority',
    'No priority'
  );
}
