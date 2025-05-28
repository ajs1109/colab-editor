'use client';
import { secondaryBtnStyles, successBtnStyles } from '@/app/commonStyles';
import { cn } from '@/lib/utils';
import { Check, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { labelColors } from '@/consts/colors';

const defaultColor = labelColors[1];

interface Props {
  mode?: 'create' | 'edit';
  data?: ICustomFieldData;
  save?: (data: ICustomFieldData) => void;
  cancel?: () => void;
  isSubmitting?: boolean;
}

export const CreateOrEditLabelForm = ({
  mode = 'create',
  data,
  cancel,
  save,
  isSubmitting,
}: Props) => {
  const [labelName, setLabelName] = useState(data?.label || '');
  const [description, setDescription] = useState(data?.description || '');
  const [color, setColor] = useState(data?.color || defaultColor);

  function isValidHexColor(code: string) {
    const hexColorPattern = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    return hexColorPattern.test(code);
  }

  function selectRandomColor() {
    const randomIndex = Math.floor(Math.random() * labelColors.length);
    setColor(labelColors[randomIndex]);
  }

  return (
    <Card className="p-6 mb-6 bg-muted dark:bg-muted/20">
      <Badge className="py-1 px-4 mb-8 " style={{ backgroundColor: color }}>
        <span className="text-white">{labelName || 'Label preview'}</span>
      </Badge>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 flex-wrap">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="space-y-2 lg:flex-grow">
            <Label>Label name</Label>
            <Input
              placeholder="Label name"
              className="h-8"
              value={labelName}
              onChange={(e) => setLabelName(e.currentTarget.value)}
            />
          </div>
          <div className="space-y-2 lg:flex-grow">
            <Label>Description</Label>
            <Input
              placeholder="Description (optional)"
              className="h-8"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <Button
                className={cn('px-3 h-8 text-white')}
                style={{ backgroundColor: color }}
                onClick={selectRandomColor}
              >
                <RefreshCcw className="w-5 h-5" />
              </Button>
              <Popover>
                <PopoverTrigger>
                  <Input
                    placeholder="color"
                    value={color}
                    onChange={(e) => setColor(e.currentTarget.value)}
                    className={`lg:w-[110px] h-8 ${
                      !isValidHexColor(color)
                        ? 'focus:ring-red-500 focus:outline-red-500'
                        : ''
                    }`}
                  />
                </PopoverTrigger>
                <PopoverContent className="flex justify-center flex-wrap">
                  {labelColors.map((labelColor) => (
                    <Button
                      key={labelColor}
                      onClick={() => setColor(labelColor)}
                      className="w-8 h-8 mr-2 mb-2 p-1"
                      style={{ backgroundColor: labelColor }}
                    >
                      {labelColor === color && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 ">
          <Button className={cn(secondaryBtnStyles)} onClick={() => cancel?.()}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              save?.({
                id: mode === 'edit' ? data?.id! : crypto.randomUUID(),
                label: labelName,
                description,
                color,
              })
            }
            className={cn(successBtnStyles)}
            disabled={
              !isValidHexColor(color) || !labelName.trim() || isSubmitting
            }
          >
            {isSubmitting
              ? 'Submitting...'
              : mode === 'edit'
              ? 'Update label'
              : 'Create label'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
