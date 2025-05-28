import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  BarChartBig,
  BarChartHorizontalBig,
  LineChart,
} from 'lucide-react';
import { useInsightsContext } from '@/contexts/insightsContext';

export const Layout = () => {
  const { setLayout } = useInsightsContext();

  return (
    <div>
      <h2 className="text-sm mb-2">Layout</h2>
      <Select
        defaultValue="column"
        onValueChange={(value) => setLayout(value as ChartLayout)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bar">
            <div className="flex">
              <BarChartHorizontalBig className="w-4 h-4 mr-2" />
              <span>Bar</span>
            </div>
          </SelectItem>
          <SelectItem value="column">
            <div className="flex">
              <BarChartBig className="w-4 h-4 mr-2" />
              <span>Column</span>
            </div>
          </SelectItem>
          <SelectItem value="line">
            <div className="flex">
              <LineChart className="w-4 h-4 mr-2" />
              <span>Line</span>
            </div>
          </SelectItem>
          <SelectItem value="stacked-area">
            <div className="flex">
              <AreaChart className="w-4 h-4 mr-2" />
              <span>Stacked Area</span>
            </div>
          </SelectItem>
          <SelectItem value="stacked-bar">
            <div className="flex">
              <BarChartHorizontalBig className="w-4 h-4 mr-2" />
              <span>Stacked Bar</span>
            </div>
          </SelectItem>
          <SelectItem value="stacked-column">
            <div className="flex">
              <BarChartBig className="w-4 h-4 mr-2" />
              <span>Stacked Column</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
