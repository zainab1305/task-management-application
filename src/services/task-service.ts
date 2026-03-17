import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { encryptText } from "@/lib/crypto";
import { AppError } from "@/lib/errors";
import { toTaskResponse } from "@/lib/task-mapper";
import { escapeRegExp } from "@/lib/utils";
import { Task } from "@/models/Task";

type ListQuery = {
  page: number;
  limit: number;
  status?: "todo" | "in_progress" | "done";
  search?: string;
};

type CreatePayload = {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
};

type UpdatePayload = {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
};

function validateTaskId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task id", 400);
  }
}

export async function listTasksForUser(userId: string, query: ListQuery) {
  await connectToDatabase();

  const filter: Record<string, unknown> = { owner: userId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.title = { $regex: escapeRegExp(query.search), $options: "i" };
  }

  const skip = (query.page - 1) * query.limit;

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    tasks: tasks.map(toTaskResponse),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function createTaskForUser(userId: string, payload: CreatePayload) {
  await connectToDatabase();

  const task = await Task.create({
    owner: userId,
    title: payload.title,
    descriptionEncrypted: encryptText(payload.description),
    status: payload.status,
  });

  return {
    task: {
      id: String(task._id),
      title: task.title,
      description: payload.description,
      status: task.status,
      createdDate: task.createdDate,
    },
  };
}

export async function getTaskByIdForUser(userId: string, taskId: string) {
  await connectToDatabase();
  validateTaskId(taskId);

  const task = await Task.findOne({ _id: taskId, owner: userId }).lean();
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return {
    task: toTaskResponse(task),
  };
}

export async function updateTaskByIdForUser(userId: string, taskId: string, payload: UpdatePayload) {
  await connectToDatabase();
  validateTaskId(taskId);

  const updateData: Record<string, unknown> = {};
  if (payload.title) {
    updateData.title = payload.title;
  }

  if (payload.status) {
    updateData.status = payload.status;
  }

  if (payload.description) {
    updateData.descriptionEncrypted = encryptText(payload.description);
  }

  const task = await Task.findOneAndUpdate({ _id: taskId, owner: userId }, updateData, {
    new: true,
  }).lean();

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return {
    task: toTaskResponse(task),
  };
}

export async function deleteTaskByIdForUser(userId: string, taskId: string) {
  await connectToDatabase();
  validateTaskId(taskId);

  const deletedTask = await Task.findOneAndDelete({ _id: taskId, owner: userId });
  if (!deletedTask) {
    throw new AppError("Task not found", 404);
  }

  return {
    message: "Task deleted",
  };
}
