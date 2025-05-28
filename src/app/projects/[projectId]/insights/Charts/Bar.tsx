import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { grayFieldColor } from '@/consts/colors';
import { getAllKeysExceptLabelKey } from '@/lib/helpers';
import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as ReBarChart,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: any[];
  config: ChartConfig;
  colors: { [label: string]: string };
}

export const BarChart = ({ data, config, colors }: Props) => {
  const keys = getAllKeysExceptLabelKey(data, 'name');

  return (
    <ChartContainer config={config} className="h-[400px] w-full">
      <ReBarChart accessibilityLayer data={data} layout="vertical">
        <CartesianGrid />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {keys.map((dataKey) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fillOpacity={0.1}
            fill={colors[dataKey] || grayFieldColor}
            stroke={colors[dataKey] || grayFieldColor}
            strokeWidth={2}
          />
        ))}
      </ReBarChart>
    </ChartContainer>
  );
};
