import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { loginSchema } from "@/lib/validations";
import { setAuthCookie } from "@/lib/cookies";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ok } from "@/lib/response";
import { loginUser } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(request, {
      keyPrefix: "auth-login",
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });

    const payload = loginSchema.parse(await request.json());
    const result = await loginUser(payload);

    const response = ok({ user: result.user });
    setAuthCookie(response, result.token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
