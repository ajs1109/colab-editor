import { Ellipsis, GripVertical } from 'lucide-react';
import * as React from 'react';
import { CustomFieldTagRenderer } from '../CustomFieldTagRenderer';
import { grayFieldColor } from '@/consts/colors';

interface CustomFieldOptionOverlayProps {
  label?: string;
  color?: string;
  description?: string;
  hiddenDescription?: boolean;
}

export const CustomFieldOptionOverlay = (
  props: CustomFieldOptionOverlayProps
) => {
  const { color, label, description, hiddenDescription } = props;

  return (
    <div className="border bg-gray-50 dark:bg-slate-900 h-[60px]">
      <div className="flex justify-between items-center p-4">
        <div className="flex gap-4 items-center">
          <span>
            <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-600 cursor-grabbing" />
          </span>

          <CustomFieldTagRenderer
            color={color || grayFieldColor}
            label={label || ''}
          />

          {!hiddenDescription && (
            <div className="hidden md:inline-block text-sm truncate">
              {description}
            </div>
          )}
        </div>

        <Ellipsis className="w-5 h-5 text-gray-400 dark:text-gray-600" />
      </div>
    </div>
  );
};
