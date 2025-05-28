import { createContext, Dispatch, SetStateAction, useContext } from 'react';

interface IInsightsContext {
  layout: ChartLayout;
  xAxis: CustomField;
  groupBy: CustomField | 'none';

  setLayout: Dispatch<SetStateAction<ChartLayout>>;
  setXAxis: Dispatch<SetStateAction<CustomField>>;
  setGroupBy: Dispatch<SetStateAction<CustomField | 'none'>>;
}

export const InsightsContext = createContext<IInsightsContext | null>(null);

export const useInsightsContext = () => {
  const context = useContext(InsightsContext);

  if (!context) {
    throw new Error(
      'useInsightsContext should be used within <InsightsContext>'
    );
  }

  return context;
};
