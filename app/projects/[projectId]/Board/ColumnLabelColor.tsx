'use client';
import { hslModifyLightness } from '@/lib/helpers';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export const ColumnLabelColor = ({ color: hslColor }: { color: string }) => {
  const { theme } = useTheme();
  const [styles, setStyles] = useState({});

  useEffect(() => {
    setStyles({
      backgroundColor: hslModifyLightness(
        hslColor,
        theme === 'light' ? 95 : 10
      ),
      color: hslModifyLightness(hslColor, theme === 'light' ? 40 : 70),
      border: `2px solid ${hslModifyLightness(
        hslColor,
        theme === 'light' ? 60 : 45
      )}`,
    });
  }, [theme, hslColor]);

  return <div className="w-4 h-4 rounded-full" style={styles} />;
};
