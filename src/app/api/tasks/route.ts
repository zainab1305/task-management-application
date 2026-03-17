import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { taskCreateSchema, taskQuerySchema } from "@/lib/validations";
import { decryptText, encryptText } from "@/lib/crypto";
import { ok } from "@/lib/response";
import { escapeRegExp } from "@/lib/utils";
import { Task } from "@/models/Task";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(request);

    const query = taskQuerySchema.parse({
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

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

    const data = tasks.map((task) => ({
      id: String(task._id),
      title: task.title,
      description: decryptText(task.descriptionEncrypted),
      status: task.status,
      createdDate: task.createdDate,
    }));

    return ok({
      tasks: data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getUserIdFromRequest(request);

    const payload = taskCreateSchema.parse(await request.json());

    const task = await Task.create({
      owner: userId,
      title: payload.title,
      descriptionEncrypted: encryptText(payload.description),
      status: payload.status,
    });

    return ok(
      {
        task: {
          id: String(task._id),
          title: task.title,
          description: payload.description,
          status: task.status,
          createdDate: task.createdDate,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
