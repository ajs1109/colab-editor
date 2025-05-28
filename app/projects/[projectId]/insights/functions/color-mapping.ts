interface IFieldWithColor {
  label: string;
  color: string;
}

export function createColorMapping<T extends IFieldWithColor>(
  items: T[]
): { [label: string]: string } {
  const colorMapping: { [label: string]: string } = {};
  items.forEach((item) => {
    colorMapping[item.label] = item.color;
  });
  return colorMapping;
}
