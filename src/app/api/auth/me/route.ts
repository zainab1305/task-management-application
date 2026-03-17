import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-auth";
import { AppError, handleApiError } from "@/lib/errors";
import { User } from "@/models/User";
import { ok } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = getUserIdFromRequest(request);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await User.findById(userId).select("name email");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
