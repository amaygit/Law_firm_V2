import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 character long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ✅ UPDATED: Projects (represents a legal Case)
const projectSchema = z.object({
  title: z.string().min(3, "Case title is required"),
  name: z.string().max(80, "Title must be at Atmost 80 characters"),
  description: z.string().optional(),
  status: z.enum(
    [
      "Filed",
      "Under Review",
      "In Court",
      "Judgment Passed",
      "Appealed",
      "Closed",
      "Withdrawn",
    ],
    {
      errorMap: () => ({ message: "Select a valid case status" }),
    }
  ),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
  // ✅ NEW: Add assignees and clients for project
  assignees: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
});

// ✅ UPDATED: Task schema - REMOVED assignees and clients
// They will be inherited from the project
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Review", "Done"]), // ✅ Added "Review"
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional(),
  // ✅ REMOVED: assignees and clients - inherited from project
});

export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  emailSchema,
  workspaceSchema,
  projectSchema,
  taskSchema,
  tokenSchema,
  inviteMemberSchema,
};
