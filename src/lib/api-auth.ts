import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { AppError } from "@/lib/errors";

export function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const payload = verifyAuthToken(token);

    if (!mongoose.Types.ObjectId.isValid(payload.sub)) {
      throw new AppError("Unauthorized", 401);
    }

    return payload.sub;
  } catch {
    throw new AppError("Unauthorized", 401);
  }
}
