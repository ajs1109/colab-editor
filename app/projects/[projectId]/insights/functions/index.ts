import { SelectedCustomField } from '@/consts';
import { getTasksByLabel } from './tasks-by-label';
import {
  getTasksByLabelsGroupedByPriority,
  getTasksByLabelsGroupedBySize,
  getTasksByLabelsGroupedByStatus,
} from './tasks-by-label-grouped-by-field';
import { getTasksByPriority } from './tasks-by-priority';
import {
  getTasksByPriorityGroupedByLabels,
  getTasksByPriorityGroupedBySize,
  getTasksByPriorityGroupedByStatus,
} from './tasks-by-priority-grouped-by-field';
import { getTasksBySize } from './tasks-by-size';
import {
  getTasksBySizeGroupedByLabels,
  getTasksBySizeGroupedByStatus,
} from './tasks-by-size-grouped-by-field';
import { getTasksByStatus } from './tasks-by-status';
import {
  getTasksByStatusGroupedByLabels,
  getTasksByStatusGroupedByPriority,
  getTasksByStatusGroupedBySize,
} from './tasks-by-status-grouped-by-field';
import { createColorMapping } from './color-mapping';

type DataGenerator = (tasks: ITask[], ...args: any[]) => any[];

const dataGenerators: { [key: string]: DataGenerator } = {
  'status,none': getTasksByStatus,
  'label,none': getTasksByLabel,
  'size,none': getTasksBySize,
  'priority,none': getTasksByPriority,

  'status,label': getTasksByStatusGroupedByLabels,
  'status,size': getTasksByStatusGroupedBySize,
  'status,priority': getTasksByStatusGroupedByPriority,

  'label,status': getTasksByLabelsGroupedByStatus,
  'label,size': getTasksByLabelsGroupedBySize,
  'label,priority': getTasksByLabelsGroupedByPriority,

  'size,status': getTasksBySizeGroupedByStatus,
  'size,label': getTasksBySizeGroupedByLabels,
  'size,priority': getTasksByStatusGroupedByPriority,

  'priority,status': getTasksByPriorityGroupedByStatus,
  'priority,label': getTasksByPriorityGroupedByLabels,
  'priority,size': getTasksByPriorityGroupedBySize,
};

export function generateChartData(
  xaxis: string,
  groupBy: string,
  tasks: ITask[],
  statuses: IStatus[],
  labels: ILabel[],
  sizes: ISize[],
  priorities: IPriority[]
): { data: any[]; colors: { [label: string]: string } } {
  const key = `${xaxis},${groupBy}`;
  const dataGenerator = dataGenerators[key];

  if (!dataGenerator) {
    throw new Error(`No data generator found for selected options: ${key}`);
  }

  switch (key) {
    case SelectedCustomField.TasksByStatus:
      return {
        data: dataGenerator(tasks, statuses),
        colors: createColorMapping(statuses),
      };
    case SelectedCustomField.TasksByLabel:
      return {
        data: dataGenerator(tasks, labels),
        colors: createColorMapping(labels),
      };
    case SelectedCustomField.TasksBySize:
      return {
        data: dataGenerator(tasks, sizes),
        colors: createColorMapping(sizes),
      };
    case SelectedCustomField.TasksByPriority:
      return {
        data: dataGenerator(tasks, priorities),
        colors: createColorMapping(priorities),
      };
    case SelectedCustomField.TasksByStatusGroupedByLabel:
      return {
        data: dataGenerator(tasks, statuses, labels),
        colors: createColorMapping(labels),
      };
    case SelectedCustomField.TasksByStatusGroupedBySize:
      return {
        data: dataGenerator(tasks, statuses, sizes),
        colors: createColorMapping(sizes),
      };
    case SelectedCustomField.TasksByStatusGroupedByPriority:
      return {
        data: dataGenerator(tasks, statuses, priorities),
        colors: createColorMapping(priorities),
      };
    case SelectedCustomField.TasksByLabelGroupedByStatus:
      return {
        data: dataGenerator(tasks, labels, statuses),
        colors: createColorMapping(statuses),
      };
    case SelectedCustomField.TasksByLabelGroupedBySize:
      return {
        data: dataGenerator(tasks, labels, sizes),
        colors: createColorMapping(sizes),
      };
    case SelectedCustomField.TasksByLabelGroupedByPriority:
      return {
        data: dataGenerator(tasks, labels, priorities),
        colors: createColorMapping(priorities),
      };
    case SelectedCustomField.TasksBySizeGroupedByStatus:
      return {
        data: dataGenerator(tasks, sizes, statuses),
        colors: createColorMapping(statuses),
      };
    case SelectedCustomField.TasksBySizeGroupedByLabel:
      return {
        data: dataGenerator(tasks, sizes, labels),
        colors: createColorMapping(labels),
      };
    case SelectedCustomField.TasksBySizeGroupedByPriority:
      return {
        data: dataGenerator(tasks, sizes, priorities),
        colors: createColorMapping(priorities),
      };
    case SelectedCustomField.TasksByPriorityGroupedByStatus:
      return {
        data: dataGenerator(tasks, priorities, statuses),
        colors: createColorMapping(statuses),
      };
    case SelectedCustomField.TasksByPriorityGroupedByLabel:
      return {
        data: dataGenerator(tasks, priorities, labels),
        colors: createColorMapping(labels),
      };
    case SelectedCustomField.TasksByPriorityGroupedBySize:
      return {
        data: dataGenerator(tasks, priorities, sizes),
        colors: createColorMapping(sizes),
      };
    default:
      throw new Error(
        `Unhandled data generation case for selected options: ${key}`
      );
  }
}
