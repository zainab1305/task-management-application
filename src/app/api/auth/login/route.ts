import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AppError, handleApiError } from "@/lib/errors";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signAuthToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";
import { ok } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const payload = loginSchema.parse(await request.json());
    const user = await User.findOne({ email: payload.email });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signAuthToken({ sub: String(user._id), email: user.email });

    const response = ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
