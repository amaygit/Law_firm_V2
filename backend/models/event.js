import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ✅ REMOVED: workspace field (making it independent)

    // ✅ NEW: Support for up to 2 phone numbers
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],

    // WhatsApp notification settings
    notificationSent: {
      type: Boolean,
      default: false,
    },
    reminderJobId: {
      type: String, // For storing scheduled job ID
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

// ✅ Validation: Ensure max 2 phone numbers
eventSchema.pre("save", function (next) {
  if (this.phoneNumbers && this.phoneNumbers.length > 2) {
    const error = new Error("Maximum 2 phone numbers allowed");
    error.name = "ValidationError";
    return next(error);
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
