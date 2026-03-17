import { clearAuthCookie } from "@/lib/cookies";
import { ok } from "@/lib/response";

export async function POST() {
  const response = ok({ message: "Logged out" });
  clearAuthCookie(response);
  return response;
}
