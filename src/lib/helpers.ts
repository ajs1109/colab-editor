export function hslModifyLightness(hsl: string, newLightness: number) {
  if (newLightness < 0 || newLightness > 100) {
    throw new Error('Lightness should be a percentage between 0 and 100');
  }
  const hslPattern = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  const match = hsl.match(hslPattern);

  if (!match) {
    throw new Error('Invalid HSL color string');
  }

  const h = match[1];
  const s = match[2];

  return `hsl(${h}, ${s}%, ${newLightness}%)`;
}

export const getCustomFieldTagColorsForTheme = (
  hslColor: string,
  theme: string | undefined
) => ({
  backgroundColor: hslModifyLightness(hslColor, theme === 'light' ? 90 : 15),
  color: hslModifyLightness(hslColor, theme === 'light' ? 40 : 70),
  border: `1px solid ${hslModifyLightness(
    hslColor,
    theme === 'light' ? 60 : 45
  )}`,
});

export function getAllKeysExceptLabelKey(
  data: any[],
  labelKey: string
): string[] {
  const keysSet = new Set<string>();

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== labelKey) {
        keysSet.add(key);
      }
    });
  });

  return Array.from(keysSet);
}

type Identifiable = {
  id: string;
  [key: string]: any;
};

export function compareArrays<T extends Identifiable>(
  arr1: T[],
  arr2: T[]
): { isChanged: boolean; data: T[] } {
  const changedItems: T[] = [];
  const map2 = new Map(arr2.map((item) => [item.id, item]));

  for (const item1 of arr1) {
    const item2 = map2.get(item1.id);
    if (!item2) {
      continue;
    }

    for (const key in item1) {
      if (item1[key] !== item2[key]) {
        changedItems.push(item2);
        break;
      }
    }

    map2.delete(item1.id);
  }

  const newItems = Array.from(map2.values());
  changedItems.push(...newItems);

  return { isChanged: changedItems.length > 0, data: changedItems };
}
