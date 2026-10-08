export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function notFound(message = 'Not found'): ApiError {
  return new ApiError(404, message);
}
