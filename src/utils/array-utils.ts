type ComparableItem = {
  id: string;
  [key: string]: any;
};

export const compareAndUpdateItems = <T extends ComparableItem>(
  originalItems: T[],
  newItems: T[]
): {
  itemsToAdd: T[];
  itemsToUpdate: T[];
  itemsToDelete: string[];
} => {
  const originalMap = new Map(originalItems.map((item) => [item.id, item]));
  const newMap = new Map(newItems.map((item) => [item.id, item]));

  const itemsToAdd: T[] = [];
  const itemsToUpdate: T[] = [];
  const itemsToDelete: string[] = [];

  // Find items to add or update
  newItems.forEach((newItem) => {
    const originalItem = originalMap.get(newItem.id);
    if (!originalItem) {
      itemsToAdd.push(newItem);
    } else if (JSON.stringify(originalItem) !== JSON.stringify(newItem)) {
      itemsToUpdate.push(newItem);
    }
  });

  // Find items to delete
  originalItems.forEach((originalItem) => {
    if (!newMap.has(originalItem.id)) {
      itemsToDelete.push(originalItem.id);
    }
  });

  return { itemsToAdd, itemsToUpdate, itemsToDelete };
};

export const hasChanges = <T extends ComparableItem>(
  originalItems: T[],
  newItems: T[]
): boolean => {
  const { itemsToAdd, itemsToUpdate, itemsToDelete } = compareAndUpdateItems(
    originalItems,
    newItems
  );
  return (
    itemsToAdd.length > 0 ||
    itemsToUpdate.length > 0 ||
    itemsToDelete.length > 0
  );
};
