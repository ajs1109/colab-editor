'use client';
import { successBtnStyles } from '@/app/commonStyles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { emails } from '@/utils/emails';
import { createClient } from '@/utils/supabase/client';
import { Loader2, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RoleSelect } from './RoleSelect';

interface Props {
  projectName: string;
  projectId: string;
  onMemberAdded?: (member: MemberWithUser) => void;
  currentUserRole: Role;
  createdBy: string;
}

const supabase = createClient();

export const InviteUsers = ({
  projectName,
  projectId,
  onMemberAdded,
  currentUserRole,
  createdBy,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [role, setRole] = useState<Role>('read');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(data);
      }
    }
    getUser();
  }, []);

  const debouncedSearch = useDebounce(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // First get existing member user_ids
      const { data: existingMembers } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId);

      const excludeUserIds = [
        ...(existingMembers?.map((m) => m.user_id) || []),
        currentUser?.id,
        createdBy,
      ].filter(Boolean);

      // Then search users excluding existing members, current user and creator
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('name', `%${term}%`)
        .not('id', 'in', `(${excludeUserIds.join(',')})`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to search users',
      });
    } finally {
      setIsSearching(false);
    }
  }, 1000);

  const handleInvite = async () => {
    if (!selectedUser) return;

    try {
      setIsInviting(true);

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', selectedUser.id)
        .single();

      if (existingMember) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User is already a member of this project',
        });
        return;
      }

      // Create the database record without the user field
      const memberRecord = {
        id: crypto.randomUUID(),
        project_id: projectId,
        user_id: selectedUser.id,
        role,
        invitationStatus: 'invited',
        invited_at: new Date(),
      };

      // Create project member record
      const { error: memberError } = await supabase
        .from('project_members')
        .insert(memberRecord);

      if (memberError) throw memberError;

      // Create the full member object for the frontend
      const newMember = {
        ...memberRecord,
        user: selectedUser,
      } as MemberWithUser;

      // Send invitation email
      await emails.sendProjectInvitation({
        to: selectedUser.email,
        projectId,
        role,
        username: selectedUser.name,
        projectName,
        invitedByUsername: currentUser?.name || '',
      });

      onMemberAdded?.(newMember);

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });

      // Reset form
      setSelectedUser(null);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send invitation',
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (currentUserRole !== 'admin') {
    return null;
  }

  return (
    <div className="py-8">
      <h1 className="text-xl mb-4">Invite users</h1>
      <div className="flex items-center gap-2">
        <div className="relative ml-auto flex-1">
          <User className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          {isSearching && (
            <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin" />
          )}
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder="Search by name..."
            className="w-full rounded-sm bg-background pl-8 h-8"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-sm shadow-lg z-10">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchTerm(user.name);
                    setSearchResults([]);
                  }}
                >
                  {user.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <RoleSelect value={role} onValueChange={setRole} />
        <Button
          onClick={handleInvite}
          className={cn(successBtnStyles, 'px-3')}
          disabled={!selectedUser || isInviting}
        >
          {isInviting ? 'Inviting...' : 'Invite'}
        </Button>
      </div>
    </div>
  );
};
