'Use client';
import { getCustomFieldTagColorsForTheme } from '@/lib/helpers';
import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { useTheme } from 'next-themes';

export const CustomFieldTagRenderer = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => {
  const { theme } = useTheme();
  const [styles, setStyles] = useState<object | undefined>(undefined);

  useEffect(() => {
    setStyles(getCustomFieldTagColorsForTheme(color, theme));
  }, [theme, color]);

  return styles && <Badge style={styles}>{label}</Badge>;
};
