export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  isEmailVerified: boolean;
  updatedAt: Date;
  profilePicture: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  color: string;
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  FILED = "Filed",
  UNDER_REVIEW = "Under Review",
  IN_COURT = "In Court",
  JUDGMENT_PASSED = "Judgment Passed",
  APPEALED = "Appealed",
  CLOSED = "Closed",
  WITHDRAWN = "Withdrawn",
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Workspace;
  startDate: Date;
  dueDate: Date;
  progress: number;
  tasks: Task[];
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
  }[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: Boolean;
}
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";
export enum ProjectMemberRole {
  MANAGER = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  dueDate: Date;
  priority: TaskPriority;
  assignee: User | string;
  createdBy: User | string;
  assignees: User[];
  clients: User[];
  subtasks?: Subtask[];
  watchers?: User[];
  attachments?: Attachment[];
  courtName?: string;
  hearings?: Hearing[];
}
export interface Hearing {
  date: string; // ISO string
  description?: string;
  inFavour: boolean;
  createdAt: string;
}
export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export interface MemberProps {
  _id: string;
  user: User;
  role: "admin" | "member" | "owner" | "viewer";
  joinedAt: Date;
}

export type ResourceType =
  | "Task"
  | "Project"
  | "Workspace"
  | "Comment"
  | "User";

export type ActionType =
  | "created_task"
  | "updated_task"
  | "created_subtask"
  | "updated_subtask"
  | "completed_task"
  | "created_project"
  | "updated_project"
  | "completed_project"
  | "created_workspace"
  | "updated_workspace"
  | "added_comment"
  | "added_member"
  | "removed_member"
  | "joined_workspace"
  | "added_attachment"
  | "removed_attachment";

export interface ActivityLog {
  _id: string;
  user: User;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  details: any;
  createdAt: Date;
}

export interface CommentReaction {
  emoji: string;
  user: User;
}

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}
export interface InternalComment {
  _id: string;
  author: User;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}
export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
}

export interface TaskTrendsData {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

export interface WorkspaceProductivityData {
  name: string;
  completed: number;
  total: number;
}
// export interface Event {
//   _id: string;
//   title: string;
//   description?: string;
//   dateTime: string;
//   phoneNumber: string;
//   createdBy: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   workspace: string;
//   notificationSent: boolean;
//   reminderJobId?: string;
//   status: "scheduled" | "completed" | "cancelled";
//   createdAt: string;
//   updatedAt: string;
// }
export interface Event {
  _id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  phoneNumbers: string[]; // ✅ Changed to array, max 2 numbers
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  // ✅ REMOVED: workspace field
  notificationSent: boolean;
  reminderJobId?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
