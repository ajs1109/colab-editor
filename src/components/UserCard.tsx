import React, { FC, memo } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { UserAvatar } from './Avatar';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  name: string;
  avatarUrl: string;
  description?: string;
  links?: IUserLink[];
  showPreviewName?: boolean;
  avatarStyles?: string;
}

// Memoized link component to prevent re-renders
const UserLink = memo(({ link }: { link: IUserLink }) => (
  <div className="flex items-center">
    <LinkIcon className="w-3 h-3 mr-1" />
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-muted-foreground hover:text-sky-500"
    >
      {link.label}
    </Link>
    <span className="text-xs text-muted-foreground px-3">|</span>
  </div>
));

UserLink.displayName = 'UserLink';

// Memoized card content to prevent re-renders
const UserCardContent = memo(
  ({ name, avatarUrl, description, links, id }: Props) => (
    <div>
      <div className="flex items-center gap-2">
        <Link href={`/profile/${id}`}>
          <UserAvatar src={avatarUrl} fallback={name.charAt(0)} />
        </Link>
        <p className="text-bold py-2 text-lg">{name}</p>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground py-3">{description}</p>
      )}

      {links && links.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="flex items-center">
            {links?.map((link) => <UserLink key={link.id} link={link} />)}
          </div>
        </>
      )}
    </div>
  )
);

UserCardContent.displayName = 'UserCardContent';

export const UserCard: FC<Props> = memo(
  ({
    id,
    name,
    avatarUrl,
    description,
    links,
    showPreviewName = true,
    avatarStyles,
  }) => {
    return (
      <HoverCard>
        <Link href={`/profile/${id}`}>
          <HoverCardTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <UserAvatar
                src={avatarUrl}
                fallback={name.charAt(0)}
                className={cn('w-6 h-6', avatarStyles)}
              />
              {showPreviewName && <span className="text-bold">{name}</span>}
            </div>
          </HoverCardTrigger>
        </Link>
        <HoverCardContent side="top" className="w-80">
          <UserCardContent
            id={id}
            name={name}
            avatarUrl={avatarUrl}
            description={description}
            links={links}
          />
        </HoverCardContent>
      </HoverCard>
    );
  }
);

UserCard.displayName = 'UserCard';
