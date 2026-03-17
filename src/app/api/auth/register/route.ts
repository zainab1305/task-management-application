import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { registerSchema } from "@/lib/validations";
import { setAuthCookie } from "@/lib/cookies";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ok } from "@/lib/response";
import { registerUser } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(request, {
      keyPrefix: "auth-register",
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });

    const payload = registerSchema.parse(await request.json());
    const result = await registerUser(payload);

    const response = ok({ user: result.user }, 201);
    setAuthCookie(response, result.token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
