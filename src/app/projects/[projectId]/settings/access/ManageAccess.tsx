'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/Avatar';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { useState, useMemo } from 'react';
import { RoleSelect } from './RoleSelect';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { useAccessStore } from '@/stores/useAccessStore';
import { ProjectAction } from '@/consts';
import { useProjectOwner } from '@/hooks/useProjectOwner';
import { Badge } from '@/components/ui/badge';

interface MemberWithUser extends IProjectMember {
  user: Pick<IUser, 'id' | 'name' | 'email' | 'avatar'>;
}

interface Props {
  members: MemberWithUser[];
  onMembersChange?: (
    members: MemberWithUser[] | ((prev: MemberWithUser[]) => MemberWithUser[])
  ) => void;
  currentUserId: string;
  projectId: string;
  createdBy: string;
  onCurrentUserRoleChange?: (newRole: Role) => void;
}

export const ManageAccess = ({
  members,
  onMembersChange,
  currentUserId,
  projectId,
  createdBy,
  onCurrentUserRoleChange,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const { can, isLoading } = useProjectAccess({ projectId });
  const { owner, isLoading: isLoadingOwner } = useProjectOwner(projectId);

  // Combine project members with owner if not already included
  const allMembers = useMemo(() => {
    if (!members || !owner) return members ?? [];
    const isOwnerInMembers = members.some((m) => m.user_id === owner.id);
    if (isOwnerInMembers) return members;

    // Add owner as a member
    return [
      {
        id: `owner-${owner.id}`,
        user_id: owner.id,
        project_id: projectId,
        role: 'owner' as Role,
        invitationStatus: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          avatar: owner.avatar,
        },
      },
      ...members,
    ];
  }, [members, owner, projectId]);

  const filteredMembers = useMemo(() => {
    return allMembers.filter((member) =>
      member.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMembers, searchTerm]);

  if (isLoading || isLoadingOwner) return <div>Loading...</div>;

  const totalMemberCount = allMembers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableMembers = filteredMembers.filter(
        (member) =>
          // Don't select current user and creator
          member.user_id !== currentUserId && member.user_id !== createdBy
      );
      setSelectedIds(new Set(selectableMembers.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectMember = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      setIsUpdatingMembers(true);
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole, updated_at: new Date() })
        .eq('id', memberId);

      if (error) throw error;

      const member = members.find((m) => m.id === memberId);
      if (member?.user_id === currentUserId) {
        onCurrentUserRoleChange?.(newRole);
      }

      onMembersChange?.((prev: MemberWithUser[]) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );

      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });

      useAccessStore.getState().reset();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update member role',
      });
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const handleRemoveMembers = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsUpdatingMembers(true);
      const idsToRemove = Array.from(selectedIds).filter((id) => {
        const member = members.find((m) => m.id === id);
        return (
          member?.user_id !== currentUserId &&
          member?.user_id !== createdBy &&
          member?.role !== 'admin'
        );
      });

      if (idsToRemove.length === 0) return;

      const { error } = await supabase
        .from('project_members')
        .delete()
        .in('id', idsToRemove);

      if (error) throw error;

      onMembersChange?.((prev: MemberWithUser[]) =>
        prev.filter((member) => !idsToRemove.includes(member.id))
      );
      setSelectedIds(new Set());

      toast({
        title: 'Success',
        description: 'Members removed successfully',
      });
    } catch (error) {
      console.error('Error removing members:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove members',
      });
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const canRemoveMembers = can(ProjectAction.REMOVE_MEMBERS);

  const canUpdateRole = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return (
      can(ProjectAction.UPDATE_MEMBER_ROLE) && member?.user_id !== createdBy
    );
  };

  return (
    <div>
      {can(ProjectAction.INVITE_MEMBERS) && (
        <h1 className="text-xl mb-4">Manage access</h1>
      )}
      <div className="rounded-md border overflow-hidden mt-4">
        <div className="bg-muted dark:bg-muted/30 flex justify-between items-center px-4 py-2 border-b">
          {canRemoveMembers && (
            <div className="flex items-center gap-4">
              <Checkbox
                checked={
                  filteredMembers.length > 0 &&
                  filteredMembers
                    .filter(
                      (m) =>
                        m.user_id !== currentUserId &&
                        m.user_id !== createdBy &&
                        m.role !== 'admin'
                    )
                    .every((m) => selectedIds.has(m.id))
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-xs">
                {selectedIds.size} of {totalMemberCount} members
              </span>
            </div>
          )}

          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isUpdatingMembers}
              onClick={handleRemoveMembers}
              className="text-red-500 hover:text-red-600"
            >
              Remove selected
            </Button>
          )}
        </div>

        <div className="px-4 py-3 border-b">
          <Input
            placeholder="Find a member"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 rounded-sm bg-muted/50 dark:bg-muted/20"
          />
        </div>

        <div className="divide-y">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {canRemoveMembers &&
                  currentUserId !== member.user_id &&
                  member.user_id !== owner?.id && (
                    <Checkbox
                      checked={selectedIds.has(member.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectMember(member.id, checked)
                      }
                    />
                  )}
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={member.user.avatar}
                    fallback={member.user.name}
                    className="h-6 w-6"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name}
                      {member.user_id === currentUserId && (
                        <span className="text-xs text-muted-foreground">
                          {' '}
                          (You)
                        </span>
                      )}
                    </p>
                    {member.invitationStatus === 'invited' && (
                      <p className="text-xs text-muted-foreground">
                        Pending invitation
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.user_id === owner?.id ? (
                  <Badge variant="secondary" className="text-xs">
                    Owner
                  </Badge>
                ) : (
                  canUpdateRole(member.id) && (
                    <RoleSelect
                      value={member.role}
                      onValueChange={(role) =>
                        handleRoleChange(member.id, role)
                      }
                      disabled={!canRemoveMembers || isUpdatingMembers}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
