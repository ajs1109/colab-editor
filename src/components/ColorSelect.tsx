'use client';
import { customFieldsColors } from '@/consts/colors';
import { hslModifyLightness } from '@/lib/helpers';
import { Circle, CircleCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dispatch, SetStateAction } from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface Props {
  color: string;
  setColor?: Dispatch<SetStateAction<string>>;
}
export const ColorSelect = ({ color, setColor }: Props) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-2 lg:flex-grow">
      <Label>Color</Label>
      <div className="flex gap-3 flex-wrap">
        {customFieldsColors.map((cfColor, i) => (
          <Button
            key={i}
            className="w-9 h-9 p-2"
            style={{
              backgroundColor:
                color === cfColor
                  ? cfColor
                  : hslModifyLightness(cfColor, theme === 'light' ? 90 : 15),
            }}
            onClick={() => setColor?.(cfColor)}
          >
            {color === cfColor ? (
              <CircleCheck style={{ color: 'white' }} />
            ) : (
              <Circle
                style={{
                  color: hslModifyLightness(
                    cfColor,
                    theme === 'light' ? 40 : 70
                  ),
                }}
              />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
