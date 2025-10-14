import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: { type: String, trim: true },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Filed",
        "Under Review",
        "In Court",
        "Judgment Passed",
        "Appealed",
        "Closed",
        "Withdrawn",
      ],
      default: "Filed",
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["manager", "contributor", "viewer"],
          default: "contributor",
        },
      },
    ],
    // ✅ NEW: Add assignees array (sublawyers)
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // ✅ NEW: Add clients array
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
