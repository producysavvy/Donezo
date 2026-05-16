import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json<ApiFailure>(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json<ApiFailure>(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten(),
        },
      },
      { status: 422 },
    );
  }

  console.error(error);

  return NextResponse.json<ApiFailure>(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      },
    },
    { status: 500 },
  );
}

export function route(handler: () => Promise<Response>) {
  return handler().catch(apiError);
}
