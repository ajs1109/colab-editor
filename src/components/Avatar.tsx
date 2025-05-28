import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  src?: string;
  fallback?: string;
  className?: string;
}

export const UserAvatar: React.FC<Props> = React.memo(
  ({ src, fallback, className, ...rest }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoadingComplete = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return (
      <Avatar className={cn('relative', className)} {...rest}>
        {src && !hasError && (
          <AvatarImage
            src={src}
            alt="user avatar"
            onLoadingStatusChange={(status) => {
              if (status === 'loaded') handleLoadingComplete();
              if (status === 'error') handleError();
            }}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}
        <AvatarFallback
          className={cn(
            'transition-opacity duration-300',
            !src || hasError || isLoading ? 'opacity-100' : 'opacity-0'
          )}
        >
          {fallback ? fallback.charAt(0).toUpperCase() : 'O'}
        </AvatarFallback>
      </Avatar>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';
