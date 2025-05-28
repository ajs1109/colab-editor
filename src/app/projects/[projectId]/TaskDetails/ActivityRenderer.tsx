import { CustomFieldTagRenderer } from '@/components/CustomFieldTagRenderer';
import { LabelBadge } from '@/components/LabelBadge';
import { UserCard } from '@/components/UserCard';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FC } from 'react';

// Helper components for each activity type
const User = ({ user }: { user?: Partial<IUser> }) => {
  if (!user) {
    return <span>Unknown User</span>;
  }

  return (
    <UserCard
      id={user.id as string}
      name={user.name as string}
      avatarUrl={user.avatar as string}
      description={user.description as string}
      links={user.links}
      avatarStyles="w-4 h-4"
    />
  );
};

const Users = ({ users }: { users?: Partial<IUser>[] }) => {
  if (!users || users.length === 0) {
    return <span>Unknown Users</span>;
  }

  return (
    <div className="flex items-center flex-wrap gap-2">
      {users?.map((user) => (
        <UserCard
          key={user.id}
          id={user.id as string}
          name={user.name as string}
          avatarUrl={user.avatar as string}
          description={user.description as string}
          links={user.links}
          avatarStyles="w-4 h-4"
        />
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status?: IStatus }) => {
  const params = useParams();

  if (!status) {
    return <span>Unknown Status</span>;
  }

  return (
    <Link
      href={`/projects/${params.projectId}/settings/statuses?option_id=${status.id}`}
    >
      <CustomFieldTagRenderer label={status.label} color={status.color} />
    </Link>
  );
};

const LabelRenderer = ({ label }: { label?: ILabel }) => {
  const params = useParams();

  if (!label) {
    return <span>Unknown Label</span>;
  }

  return (
    <Link
      href={`/projects/${params.projectId}/settings/labels?label_id=${label.id}`}
    >
      <LabelBadge
        labelText={label.label}
        description={label.description}
        color={label.color}
      />
    </Link>
  );
};

const LabelsRenderer = ({ labels }: { labels?: ILabel[] }) => {
  const params = useParams();

  if (!labels || labels.length === 0) {
    return <span>Unknown Labels</span>;
  }

  return labels.map((label) => (
    <Link
      key={label.id}
      href={`/projects/${params.projectId}/settings/labels?label_id=${label.id}`}
    >
      <LabelBadge
        labelText={label.label}
        description={label.description}
        color={label.color}
      />
    </Link>
  ));
};

const DateRenderer = ({ value }: { value: Date | string }) => {
  const date = new Date(value);
  const currentYear = new Date().getFullYear();
  const isCurrentYear = date.getFullYear() === currentYear;

  const formattedDate = isCurrentYear
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return <span>{formattedDate}</span>;
};

// Define the props and task activity types
interface ActivityRendererProps {
  activity: ActivityResponse;
  allMembers: Partial<IUser>[];
  statuses: IStatus[];
  labels: ILabel[];
}

const ActivityRenderer: FC<ActivityRendererProps> = ({
  activity,
  allMembers,
  statuses,
  labels,
}) => {
  return (
    <div className="flex items-center flex-wrap text-xs gap-1 ml-3 my-3">
      {activity.content.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <span key={index} className="text-gray-400">
              {item}
            </span>
          );
        }

        switch (item.type) {
          case 'user':
            return (
              <User
                key={index}
                user={allMembers?.find((member) => member.id === item.id)}
              />
            );
          case 'status':
            return (
              <StatusBadge
                key={index}
                status={statuses?.find(
                  (status: IStatus) => status.id === item.id
                )}
              />
            );
          case 'label':
            return (
              <LabelRenderer
                key={index}
                label={labels?.find((label: ILabel) => label.id === item.id)}
              />
            );
          case 'labels':
            return (
              <LabelsRenderer
                key={index}
                labels={item.ids
                  .map((id) => labels?.find((label: ILabel) => label.id === id))
                  ?.filter((label): label is ILabel => label !== undefined)}
              />
            );
          case 'date':
            return <DateRenderer key={index} value={item.value} />;
          case 'users':
            return (
              <Users
                key={index}
                users={item.ids
                  .map((id) => allMembers?.find((member) => member.id === id))
                  .filter((member): member is IUser => member !== undefined)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ActivityRenderer;
