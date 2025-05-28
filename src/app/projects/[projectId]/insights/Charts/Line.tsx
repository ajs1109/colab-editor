import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { defaultFieldColor } from '@/consts/colors';
import { getAllKeysExceptLabelKey } from '@/lib/helpers';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: any[];
  config: ChartConfig;
  colors: { [label: string]: string };
}

export const LineChart = ({ data, config, colors }: Props) => {
  const keys = getAllKeysExceptLabelKey(data, 'name');

  return (
    <ChartContainer config={config} className="h-[400px] w-full">
      <ReLineChart accessibilityLayer data={data}>
        <XAxis dataKey={'name'} tickLine={false} />
        <YAxis />
        <CartesianGrid />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {keys.map((dataKey, i) => (
          <Line
            type="monotone"
            key={dataKey}
            dataKey={dataKey}
            name={dataKey}
            fill={colors[dataKey] || defaultFieldColor}
            stroke={colors[dataKey] || defaultFieldColor}
            strokeWidth={2}
          />
        ))}
      </ReLineChart>
    </ChartContainer>
  );
};
