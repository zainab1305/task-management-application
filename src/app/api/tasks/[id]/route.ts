import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { taskUpdateSchema } from "@/lib/validations";
import { ok } from "@/lib/response";
import {
  deleteTaskByIdForUser,
  getTaskByIdForUser,
  updateTaskByIdForUser,
} from "@/services/task-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = await context.params;

    const result = await getTaskByIdForUser(userId, id);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = await context.params;
    const payload = taskUpdateSchema.parse(await request.json());

    const result = await updateTaskByIdForUser(userId, id, payload);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = await context.params;

    const result = await deleteTaskByIdForUser(userId, id);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
