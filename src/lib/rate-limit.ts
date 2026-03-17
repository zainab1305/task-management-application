import { NextRequest } from "next/server";
import { AppError } from "@/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function enforceRateLimit(
  request: NextRequest,
  options: { keyPrefix: string; limit: number; windowMs: number },
) {
  const now = Date.now();
  const key = `${options.keyPrefix}:${getClientIp(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.limit) {
    throw new AppError("Too many requests. Please try again later.", 429);
  }

  current.count += 1;
  buckets.set(key, current);
}
