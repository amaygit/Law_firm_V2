import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx",[
        index("routes/root/home.tsx"),
        route("sign-in","routes/auth/sign-in.tsx"),
        route("sign-up","routes/auth/sign-up.tsx"),
        route("forgot-password","routes/auth/forgot-password.tsx"),
        route("reset-password","routes/auth/reset-password.tsx"),
        route("verify-email","routes/auth/verify-email.tsx"),
    ]),
    layout("routes/dashboard/dashboard-layout.tsx",[
        route("dashboard","routes/dashboard/index.tsx"),
        route("workspaces","routes/dashboard/workspaces/index.tsx"),
        route("workspaces/:workspaceId","routes/dashboard/workspaces/workspace-details.tsx"),
         route("workspaces/:workspaceId/projects/:projectId","routes/dashboard/project/project-details.tsx"),
             route(
      "workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
      "routes/dashboard/task/task-details.tsx"
    ),
    route("settings", "routes/dashboard/settings.tsx"),

   route("workspaces/:workspaceId/settings", "routes/dashboard/workspaces/workspace-settings.tsx") ,
     route("achieved", "routes/dashboard/select-workspace.tsx"),
    //  route("dashboard/:workspaceId/achived", "routes/dashboard/task/achieved.tsx"),
    route("dashboard/ai", "routes/dashboard/ai.tsx"),


// route(
//   "dashboard/:workspaceId/tasks",
//   "routes/dashboard/task/achieved.tsx"
// ),
 route("my-tasks", "routes/dashboard/my-tasks.tsx"),
 route("members", "routes/dashboard/members.tsx"),


    ]),
      route(
    "workspace-invite/:workspaceId",
    "routes/dashboard/workspaces/workspace-invite.tsx"
  ),

  layout("routes/user/user-layout.tsx", [
    route("user/profile", "routes/user/profile.tsx"),
  ]),
] satisfies RouteConfig;
