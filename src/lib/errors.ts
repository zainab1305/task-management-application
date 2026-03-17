import { ZodError } from "zod";
import { NextResponse } from "next/server";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
        },
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          details: error.flatten(),
        },
      },
      { status: 422 },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal server error",
      },
    },
    { status: 500 },
  );
}
