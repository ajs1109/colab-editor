'use client';
import { successBtnStyles } from '@/app/commonStyles';
import { customFieldsColors } from '@/consts/colors';
import { getCustomFieldTagColorsForTheme } from '@/lib/helpers';
import { useTheme } from 'next-themes';
import { ReactNode, useState } from 'react';
import { ColorSelect } from './ColorSelect';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

const blueColor = customFieldsColors[1];

interface Props {
  color?: string;
  label?: string;
  description?: string;
  cancelButton: ReactNode;
  submitBtnLabel?: string;
  onSubmit?: (data: Omit<ICustomFieldData, 'id'>) => void;
}

export const CustomOptionForm = ({
  color: defaultColor,
  label: defaultLabel,
  description: defaultDescription,
  cancelButton,
  submitBtnLabel,
  onSubmit,
}: Props) => {
  const [color, setColor] = useState(defaultColor || blueColor);
  const [label, setLabel] = useState(defaultLabel || '');
  const [description, setDescription] = useState(defaultDescription || '');
  const { theme } = useTheme();

  const handleSubmit = () => {
    onSubmit?.({ label, color, description });
    setColor(blueColor);
    setLabel('');
    setDescription('');
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-center p6-8">
          <Badge style={getCustomFieldTagColorsForTheme(color, theme)}>
            {label || 'Preview'}
          </Badge>
        </div>
        <div className="space-y-2 lg:flex-grow">
          <Label>Label text *</Label>
          <Input
            placeholder="Label text"
            className="h-9 dark:bg-black"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <ColorSelect color={color} setColor={setColor} />

        <div className="space-y-2 lg:flex-grow">
          <Label>Description </Label>
          <Textarea
            placeholder="description"
            className="dark:bg-black"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-end gap-4">
        {cancelButton}
        <Button
          onClick={handleSubmit}
          className={cn(successBtnStyles)}
          disabled={!label}
        >
          {submitBtnLabel || 'Submit'}
        </Button>
      </div>
    </>
  );
};
