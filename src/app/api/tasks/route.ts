import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { taskCreateSchema, taskQuerySchema } from "@/lib/validations";
import { ok } from "@/lib/response";
import { createTaskForUser, listTasksForUser } from "@/services/task-service";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    const query = taskQuerySchema.parse({
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

    const result = await listTasksForUser(userId, query);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const payload = taskCreateSchema.parse(await request.json());

    const result = await createTaskForUser(userId, payload);
    return ok(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
