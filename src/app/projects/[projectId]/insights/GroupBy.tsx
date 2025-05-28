import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInsightsContext } from '@/contexts/insightsContext';
import { SquareChevronDown, Tag } from 'lucide-react';

export const GroupByOptions: {
  value: CustomField | 'none';
  label: string;
  icon: JSX.Element;
}[] = [
  {
    value: 'none',
    label: 'None',
    icon: <></>,
  },
  {
    value: 'label',
    label: 'Labels',
    icon: <Tag className="w-4 h-4 mr-2" />,
  },
  {
    value: 'size',
    label: 'Size',
    icon: <SquareChevronDown className="w-4 h-4 mr-2" />,
  },
  {
    value: 'priority',
    label: 'Priority',
    icon: <SquareChevronDown className="w-4 h-4 mr-2" />,
  },
  {
    value: 'status',
    label: 'Status',
    icon: <SquareChevronDown className="w-4 h-4 mr-2" />,
  },
];

export const GroupBy = () => {
  const { setGroupBy, xAxis } = useInsightsContext();

  return (
    <div>
      <h2 className="text-sm mb-2">Group by (optional)</h2>
      <Select
        defaultValue="none"
        onValueChange={(value) => setGroupBy(value as CustomField)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {GroupByOptions.map(
            (option) =>
              option.value !== xAxis && (
                <SelectItem value={option.value} key={option.value}>
                  <div className="flex">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              )
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
