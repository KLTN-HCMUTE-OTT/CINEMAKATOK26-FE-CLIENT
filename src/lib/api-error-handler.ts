import { AxiosError } from "axios";

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  response?: ApiErrorResponse;

  constructor(error: AxiosError<ApiErrorResponse>) {
    super(error.message);
    this.name = "ApiError";
    this.statusCode = error.response?.status || 500;
    this.response = error.response?.data;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return new ApiError(error);
  }
  return new ApiError({
    message: "Unknown error occurred",
    response: {
      status: 500,
      data: {
        statusCode: 500,
        message: "Unknown error occurred",
      },
    },
  } as AxiosError<ApiErrorResponse>);
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.response?.message || apiError.message || "An error occurred";
};
