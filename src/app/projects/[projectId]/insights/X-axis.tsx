import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInsightsContext } from '@/contexts/insightsContext';
import { SquareChevronDown, Tag } from 'lucide-react';

export const XAxisOptions: {
  value: CustomField;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    value: 'status',
    label: 'Status',
    icon: <SquareChevronDown className="w-4 h-4 mr-2" />,
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
];

export const XAxis = () => {
  const { setXAxis, groupBy } = useInsightsContext();

  return (
    <div>
      <h2 className="text-sm mb-2">X-axis</h2>
      <Select
        defaultValue="status"
        onValueChange={(value) => setXAxis(value as CustomField)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {XAxisOptions.map(
            (option) =>
              groupBy !== option.value && (
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
