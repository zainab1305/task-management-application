import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AppError, handleApiError } from "@/lib/errors";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signAuthToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";
import { ok } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const payload = registerSchema.parse(await request.json());

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
    });

    const token = signAuthToken({ sub: String(user._id), email: user.email });

    const response = ok(
      {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
        },
      },
      201,
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
