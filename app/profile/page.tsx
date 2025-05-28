import { createClient } from '@/utils/supabase/server';
import { users, type IUser } from '@/utils/users';
import { ProfileForm } from './ProfileForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const userData = await users.getUser(user.id);
  if (!userData) redirect('/login');

  return <ProfileForm initialData={userData} />;
}
