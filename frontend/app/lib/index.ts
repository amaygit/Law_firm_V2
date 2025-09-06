import type { ProjectStatus, Task, TaskStatus } from "@/types";

export const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "*",
];

export const getTaskStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "Filed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Under Review":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "In Court":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "Judgment Passed":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Appealed":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "Closed":
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    case "Withdrawn":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export const getProjectProgress = (tasks: { status: TaskStatus }[]) => {
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) => task?.status === "Done").length;

  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return progress;
};