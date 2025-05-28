'use client';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { InsightsContext } from '@/contexts/insightsContext';
import { ChartRenderer } from './ChartRenderer';
import { GroupBy } from './GroupBy';
import { Layout } from './Layout';
import { XAxis } from './X-axis';

interface Props {
  initialData: {
    tasks: ITask[];
    statuses: IStatus[];
    labels: ILabel[];
    sizes: ISize[];
    priorities: IPriority[];
  };
}

export const Insights = ({ initialData }: Props) => {
  const [layout, setLayout] = useState<ChartLayout>('column');
  const [xAxis, setXAxis] = useState<CustomField>('status');
  const [groupBy, setGroupBy] = useState<CustomField | 'none'>('none');

  return (
    <InsightsContext.Provider
      value={{ layout, xAxis, groupBy, setLayout, setXAxis, setGroupBy }}
    >
      <div className="container py-4">
        <h1>Insights</h1>
        <Separator className="my-2" />
        <div className="flex flex-col lg:flex-row py-6 gap-6">
          <div className="w-full lg:w-[300px] space-y-6">
            <h2 className="text-sm font-bold">Configure chart</h2>
            <Layout />
            <XAxis />
            <GroupBy />
          </div>
          <div className="flex-grow">
            <p className="pb-4">
              This chart shows the current status for the total number of items
              in your project.
            </p>
            <ChartRenderer layout={layout} data={initialData} />
          </div>
        </div>
      </div>
    </InsightsContext.Provider>
  );
};
