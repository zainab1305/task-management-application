import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { AppError, handleApiError } from "@/lib/errors";
import { taskUpdateSchema } from "@/lib/validations";
import { decryptText, encryptText } from "@/lib/crypto";
import { ok } from "@/lib/response";
import { Task } from "@/models/Task";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateTaskId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task id", 400);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(request);

    const { id } = await context.params;
    validateTaskId(id);

    const task = await Task.findOne({ _id: id, owner: userId }).lean();
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return ok({
      task: {
        id: String(task._id),
        title: task.title,
        description: decryptText(task.descriptionEncrypted),
        status: task.status,
        createdDate: task.createdDate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(request);

    const { id } = await context.params;
    validateTaskId(id);

    const payload = taskUpdateSchema.parse(await request.json());
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

    const task = await Task.findOneAndUpdate({ _id: id, owner: userId }, updateData, {
      new: true,
    }).lean();

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return ok({
      task: {
        id: String(task._id),
        title: task.title,
        description: decryptText(task.descriptionEncrypted),
        status: task.status,
        createdDate: task.createdDate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(request);

    const { id } = await context.params;
    validateTaskId(id);

    const deletedTask = await Task.findOneAndDelete({ _id: id, owner: userId });
    if (!deletedTask) {
      throw new AppError("Task not found", 404);
    }

    return ok({ message: "Task deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
