import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface User {
  id: string;
  name: string;
  color: string;
}

export function UserPresence({ 
  users, 
  currentUserId 
}: { 
  users: User[];
  currentUserId: string;
}) {
  return (
    <div className="flex items-center -space-x-2">
      {users.filter(user => user.id !== currentUserId).map(user => (
        <Tooltip key={user.id}>
          <TooltipTrigger asChild>
            <div className="relative">
              <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color }}>
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background"
                style={{ backgroundColor: user.color }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {user.name} (editing)
          </TooltipContent>
        </Tooltip>
      ))}
      {users.some(user => user.id === currentUserId) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            You (editing)
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}