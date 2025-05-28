import { UserCard } from './UserCard';

export default function StackedAvatars({ users }: { users: Partial<IUser>[] }) {
  return (
    <div className="flex items-center -space-x-2 hover:-space-x-0">
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id || ''}
          name={user.name || ''}
          avatarUrl={user.avatar || ''}
          description={user.description || ''}
          links={user.links || []}
          showPreviewName={false}
          avatarStyles="w-4 h-4 border-2 border-gray-300 dark:border-gray-800"
        />
      ))}
    </div>
  );
}
