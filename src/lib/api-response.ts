import { NextResponse } from "next/server";
import { AppError } from "./api-errors";

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Success Response Helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

/**
 * Error Response Helper
 */
export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.constructor.name,
        message: error.message,
        details: (error as any).details,
      },
      { status: error.statusCode },
    );
  }

  // Handle Prisma / Database Errors specifically if needed
  console.error("Unhandled API Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "InternalServerError",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      details: error instanceof Error ? error.stack : undefined,
    },
    { status: 500 },
  );
}
