import { UserAvatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

interface MentionListProps {
  items: Partial<IUser>[];
  command: (item: { label: string; id: string }) => void;
}

export interface MentionListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  function MentionList(props, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command({ label: item.name || '', id: item.id || '' });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="bg-gray-200 dark:bg-gray-900 border p-2 rounded-sm mention-dropdown-menu">
        {props.items.length ? (
          props.items.map((user, index) => (
            <Button
              variant="ghost"
              className={cn(
                `mention-btn-${index}`,
                'w-full flex justify-start items-center py-1 px-2 rounded-sm',
                index === selectedIndex ? 'bg-gray-50 dark:bg-gray-800' : ''
              )}
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectItem(index);
              }}
            >
              <UserAvatar
                src={user.avatar}
                fallback={user.name}
                className="w-4 h-4 mr-2"
              />
              {user.name}
            </Button>
          ))
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    );
  }
);

export default MentionList;
