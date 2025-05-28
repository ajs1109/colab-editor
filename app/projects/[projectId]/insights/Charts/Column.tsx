'use client';
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
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis
} from 'recharts';

interface Props {
  data: any[];
  config: ChartConfig;
  colors: { [label: string]: string };
}

export const ColumnChart = ({ data, config, colors }: Props) => {
  const keys = getAllKeysExceptLabelKey(data, 'name');

  return (
    <ChartContainer config={config} className="h-[400px] w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />

        {keys.map((dataKey) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fill={colors[dataKey] || grayFieldColor}
            stroke={colors[dataKey] || grayFieldColor}
            strokeWidth={2}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};
