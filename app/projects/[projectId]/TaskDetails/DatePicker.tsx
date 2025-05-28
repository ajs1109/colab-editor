import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
}

export const DatePicker = ({ date, onSelect }: DatePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger>
        {date ? (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {format(date, 'PPP')}
          </span>
        ) : (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            No Date
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 mr-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
