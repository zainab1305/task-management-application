import { ok } from "@/lib/response";

export async function GET() {
  return ok({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
