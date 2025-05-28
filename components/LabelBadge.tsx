import Link from 'next/link';
import React, { FC } from 'react';

interface Props {
  labelText: string;
  description?: string;
  color: string;
}

const classes =
  'mx-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white';

export const LabelBadge: FC<Props> = ({ labelText, description, color }) => {
  return (
    <span
      title={description || labelText}
      className={classes}
      style={{ backgroundColor: color }}
    >
      {labelText}
    </span>
  );
};
