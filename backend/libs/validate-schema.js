import { z } from 'zod';
const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invlaid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
    email: z.string().email("Invlaid email address"),
    password: z.string().min(1, "Password is required"),
});
const verifyEmailSchema = z.object({
    token: z.string().min(1,"Token is required"),
});

const resetPasswordSchema=z.object({
    token:z.string().min(1,"Token is required"),
    newPassword: z.string().min(8,"Password must be at least 8 character long"),
    confirmPassword: z.string().min(1,"Confirm password is required"),
})

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const workspaceSchema = z.object({
    name: z.string().min(1,"Name is required"),
    description:z.string().optional(),
    color:z.string().min(1,"Color is required"),
})
const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});
const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
// ✅ Projects (represents a legal Case)
const projectSchema = z.object({
  title: z.string().min(3, "Case title is required"),
  description: z.string().optional(),
  status: z.enum([
        "Filed",
        "Under Review",
        "In Court",
        "Judgment Passed",
        "Appealed",
        "Closed",
        "Withdrawn"
      
  ], {
    errorMap: () => ({ message: "Select a valid case status" }),
  }),
  startDate: z.string().min(1, "Start date is required"),
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
});
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});


export {
    registerSchema,loginSchema,verifyEmailSchema,resetPasswordSchema,emailSchema,workspaceSchema,projectSchema, taskSchema,tokenSchema,inviteMemberSchema
}
