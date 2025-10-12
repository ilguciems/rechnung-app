import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

/**
 * Validate a query and execute a handler with the parsed data.
 *
 * This function takes a request, a schema and a handler function.
 * It tries to parse the request's query parameters using the given schema.
 * If the parsing is successful, it calls the handler function with the parsed data.
 * If the parsing fails, it returns a 400 error response with the validation errors.
 * If an unexpected error occurs, it returns a 500 error response.
 *
 * @param {Request} req - The request to validate.
 * @param {ZodType<T>} schema - The schema to validate the request against.
 * @param {(data: T) => Promise<Response>} handler - The handler function to call with the parsed data.
 * @returns {Promise<Response>} - A promise resolving to the response returned by the handler or an error response if the parsing fails or an unexpected error occurs.
 */
export async function validateQuery<T>(
  req: Request,
  schema: ZodType<T>,
  handler: (data: T) => Promise<Response>,
): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = schema.parse(params);

    return await handler(parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", issues: err.issues },
        { status: 400 },
      );
    }

    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
