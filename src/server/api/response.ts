import { NextResponse } from 'next/server';

/**
 * Standard API response envelope (CLAUDE.md › Error Handling): every route
 * returns `success`, `data`, `error` and `message`.
 */
export interface ApiSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly error: null;
  readonly message: string;
}

export interface ApiFailure {
  readonly success: false;
  readonly data: null;
  readonly error: string;
  readonly message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Build a success response. */
export function ok<T>(data: T, message = 'OK', status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, error: null, message }, { status });
}

/**
 * Build a failure response. `error` is a stable machine code; `message` is a
 * safe human-readable string that never exposes internal implementation.
 */
export function fail(error: string, message: string, status = 400): NextResponse<ApiFailure> {
  return NextResponse.json({ success: false, data: null, error, message }, { status });
}
