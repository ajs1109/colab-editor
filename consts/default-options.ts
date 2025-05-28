import { v4 as uid } from 'uuid';

export const defaultSizes: ICustomFieldData[] = [
  {
    id: uid(),
    label: 'S',
    description: '',
    color: 'hsl(156, 87%, 36%)',
  },
  {
    id: uid(),
    label: 'M',
    description: '',
    color: 'hsl(212, 66%, 50%)',
  },
  {
    id: uid(),
    label: 'L',
    description: '',
    color: 'hsl(45, 90%, 54%)',
  },
  {
    id: uid(),
    label: 'XL',
    description: '',
    color: 'hsl(274, 100%, 76%)',
  },
];

export const defaultStatuses: ICustomFieldData[] = [
  {
    id: uid(),
    label: 'Backlog',
    description: "This item hasn't been started",
    color: 'hsl(156, 87%, 36%)',
  },
  {
    id: uid(),
    label: 'Ready',
    description: 'This is ready to be picked up',
    color: 'hsl(212, 66%, 50%)',
  },
  {
    id: uid(),
    label: 'In Progress',
    description: 'This is actively being worked on',
    color: 'hsl(45, 90%, 54%)',
  },
  {
    id: uid(),
    label: 'In Review',
    description: 'This item is in review',
    color: 'hsl(274, 100%, 76%)',
  },
  {
    id: uid(),
    label: 'Done',
    description: 'This has been completed',
    color: 'hsl(26, 87%, 54%)',
  },
];

export const defaultPriorities: ICustomFieldData[] = [
  {
    id: uid(),
    label: 'P0',
    description: '',
    color: 'hsl(353, 65%, 53%)',
  },
  {
    id: uid(),
    label: 'P1',
    description: '',
    color: 'hsl(26, 87%, 54%)',
  },
  {
    id: uid(),
    label: 'P2',
    description: '',
    color: 'hsl(45, 90%, 54%)',
  },
  {
    id: uid(),
    label: 'P3',
    description: '',
    color: 'hsl(212, 66%, 50%)',
  },
];

export const defaultLabels: ICustomFieldData[] = [
  {
    id: uid(),
    label: 'enhancement',
    description: 'New feature or request',
    color: '#728dec',
  },
  {
    id: uid(),
    label: 'bug',
    description: "Something isn't working.",
    color: '#dc3a48',
  },
  {
    id: uid(),
    label: 'documentation',
    description: 'Improvements or additions to documentation',
    color: '#007ad4',
  },

  {
    id: uid(),
    label: 'duplicate',
    description: 'This feature already exists',
    color: '#4c4c63',
  },
  {
    id: uid(),
    label: 'good first issue',
    description: 'Good for beginners',
    color: '#7158fe',
  },
  {
    id: uid(),
    label: 'help wanted',
    description: 'Extra attention is needed',
    color: '#008975',
  },
  {
    id: uid(),
    label: 'invalid',
    description: "This doesn't seem right",
    color: '#e6e367',
  },
  {
    id: uid(),
    label: 'question',
    description: 'Further information is requested',
    color: '#d07adc',
  },
  {
    id: uid(),
    label: 'wontfix',
    description: 'This will not be worked on',
    color: '#4c4c63',
  },
];
