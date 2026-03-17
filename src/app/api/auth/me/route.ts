import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { handleApiError } from "@/lib/errors";
import { ok } from "@/lib/response";
import { getCurrentUser } from "@/services/auth-service";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const result = await getCurrentUser(userId);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
