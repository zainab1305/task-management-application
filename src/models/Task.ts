import mongoose, { InferSchemaType, Model } from "mongoose";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    descriptionEncrypted: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "todo",
      index: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ owner: 1, createdDate: -1 });

export type TaskDocument = InferSchemaType<typeof taskSchema> & { _id: mongoose.Types.ObjectId };

export const Task: Model<TaskDocument> =
  (mongoose.models.Task as Model<TaskDocument>) || mongoose.model<TaskDocument>("Task", taskSchema);
