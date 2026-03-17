import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { signAuthToken } from "@/lib/auth";
import { User } from "@/models/User";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

function toUserResponse(user: { _id: mongoose.Types.ObjectId; name: string; email: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}

export async function registerUser(payload: RegisterPayload) {
  await connectToDatabase();

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

  return {
    user: toUserResponse(user),
    token: signAuthToken({ sub: String(user._id), email: user.email }),
  };
}

export async function loginUser(payload: LoginPayload) {
  await connectToDatabase();

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    user: toUserResponse(user),
    token: signAuthToken({ sub: String(user._id), email: user.email }),
  };
}

export async function getCurrentUser(userId: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await User.findById(userId).select("name email");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    user: toUserResponse(user),
  };
}
