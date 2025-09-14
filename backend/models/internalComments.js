import mongoose, { Schema } from "mongoose";

const internalCommentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        offset: {
          type: Number,
        },
        length: {
          type: Number,
        },
      },
    ],
    reactions: [
      {
        emoji: {
          type: String,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
      },
    ],
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InternalComment = mongoose.model(
  "InternalComment",
  internalCommentSchema
);

export default InternalComment;
