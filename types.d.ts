type Role = 'read' | 'write' | 'admin' | 'owner';
type InvitationStatus = 'invited' | 'accepted' | 'declined' | 'expired';

type ChartLayout =
  | 'bar'
  | 'column'
  | 'line'
  | 'stacked-area'
  | 'stacked-bar'
  | 'stacked-column';

type CustomField = 'status' | 'label' | 'size' | 'priority';

interface IUserLink {
  id: string;
  label: string;
  url: string;
}

interface IUser {
  id: string;
  email: string;
  name: string;
  description: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  links: IUserLink[];
  provider: 'google' | 'github' | 'email';
}

interface IProject {
  id: string;
  name: string;
  description: string;
  readme: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  closed: boolean;
}

interface IProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: Role;
  invitationStatus: InvitationStatus;
  invited_at: Date;
  joined_at?: Date;
}

interface IField {
  id: string;
  label: string;
  description: string;
  color: string;
  created_at?: Date;
  updated_at?: Date;
  project_id?: string;
}

interface IStatus extends IField {
  order: number;
  limit: number;
}

interface ILabel extends IField {}
interface IPriority extends IField {
  order: number;
}
interface ISize extends IField {
  order: number;
}

interface ITask {
  id: string;
  project_id: string;
  status_id: string;
  title: string;
  description: string;
  labels: string[];
  priority: string | null;
  size: string | null;
  startDate: Date | null;
  endDate: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  statusPosition: number;
  assignees?: string[];
}

interface IComment {
  id: string;
  content: string;
  user_id: string;
  task_id: string;
  created_at: Date;
  updated_at: Date;
}

interface CommentResponse extends Omit<IComment, 'user_id'> {
  user: Partial<IUser>;
}

type ActivityType = 'status' | 'label' | 'labels' | 'date' | 'user' | 'users';
type ActivityPayload = 'id' | 'value' | 'ids';

type ActivityObject =
  | { type: 'status'; id: string }
  | { type: 'label'; id: string }
  | { type: 'labels'; ids: string[] }
  | { type: 'date'; value: string }
  | { type: 'user'; id: string }
  | { type: 'users'; ids: string[] };

type TaskActivity = (string | ActivityObject)[];

interface IActivity {
  id: string;
  created_at: Date;
  content: TaskActivity;
  user_id: string;
  task_id: string;
  updated_at: Date;
}

interface ActivityResponse extends Omit<IActivity, 'user_id'> {
  user: Partial<IUser>;
}

type TimelineType = 'activity' | 'comment';
interface ITimeline {
  id: string;
  created_at: Date;
  type: TimelineType;
  value: ActivityResponse | CommentResponse;
}

type CustomFieldDBTableName = 'statuses' | 'labels' | 'priorities' | 'sizes';

// ------------------------------
interface ICustomFieldData {
  id: string;
  label?: string;
  color?: string;
  description?: string;
}

// tables ----------------
//  - users
//  - projects
//  - project_members
//  - statuses
//  - labels
//  - priorities
//  - sizes
//  - tasks
//  - comments
//  - activities

type ProjectWithOptions = {
  name: string;
  description: string;
  readme: string;
  statuses?: Omit<IStatus, 'created_at' | 'updated_at'>[];
  labels?: Omit<ILabel, 'created_at' | 'updated_at'>[];
  priorities?: Omit<IPriority, 'created_at' | 'updated_at'>[];
  sizes?: Omit<ISize, 'created_at' | 'updated_at'>[];
};

interface MemberWithUser extends IProjectMember {
  user: Pick<IUser, 'id' | 'name' | 'email' | 'avatar'>;
}

interface ITaskWithOptions extends Partial<ITask> {
  creator?: {
    id: string;
    name: string;
    avatar: string;
    description: string;
    links: IUserLink[];
  };
  labels?: {
    id: string;
    label: string;
    color: string;
  }[];
  size?: {
    id: string;
    label: string;
    color: string;
  };
  priority?: {
    id: string;
    label: string;
    color: string;
    order: number;
  };
  assignees?: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    links: IUserLink[];
  }[];
}
