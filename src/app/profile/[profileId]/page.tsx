import { users, type IUser } from '@/utils/users';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileView } from './ProfileView';

async function getUser(profileId: string): Promise<IUser> {
  try {
    const user = await users.getUser(profileId);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    notFound();
  }
}

export default async function ProfileViewingPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  const user = await getUser(profileId);
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === user.id;

  return <ProfileView user={user} isOwnProfile={isOwnProfile} />;
}
