import { ReactRenderer } from '@tiptap/react';
//import tippy, { Instance, Props } from 'tippy.js';
import MentionList, { MentionListRef } from './MentionList';

interface SuggestionProps {
  editor: any;
  query: string;
  range: any;
  items: Partial<IUser>[];
  clientRect?: () => DOMRect;
}

interface OnKeyDownProps {
  event: KeyboardEvent;
}

const getSuggestion = (users: Partial<IUser>[]) => ({
  items: ({ query }: { query: string }) => {
    return users
      .filter((item) =>
        item.name?.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer<MentionListRef> | null = null;
    //let popup: Instance<Props> | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        // popup = tippy('body', {
        //   getReferenceClientRect: props.clientRect,
        //   appendTo: () => document.body,
        //   content: component.element,
        //   showOnCreate: true,
        //   interactive: true,
        //   trigger: 'manual',
        //   placement: 'bottom-start',
        //   onShow: () => {
        //     // Focus the first button when the tooltip is shown
        //     const firstButton = document.querySelector(
        //       '.mention-btn-0'
        //     ) as HTMLButtonElement;
        //     firstButton?.focus();
        //   },
        // })[0];
      },

      onUpdate(props: SuggestionProps) {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        // popup?.setProps({
        //   getReferenceClientRect: props.clientRect || props.clientRect,
        // });
      },

      onKeyDown(props: OnKeyDownProps) {
        if (props.event.key === 'Escape') {
          // popup?.hide();
          return true;
        }

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        // popup?.destroy();
        component?.destroy();
      },
    };
  },
});

export default getSuggestion as any;
