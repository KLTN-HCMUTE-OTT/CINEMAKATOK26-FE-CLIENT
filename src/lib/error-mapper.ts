/**
 * Utility to map backend or API errors to friendly user-facing messages.
 */

export interface ErrorMap {
  [key: string]: string;
}

const ERROR_MESSAGE_MAPPING: ErrorMap = {
  "token is valid": "Please sign in to watch this video.",
  "token is invalid": "Please sign in to watch this video.",
  "invalid token": "Please sign in to watch this video.",
  "unauthorized": "Please sign in to watch this video.",
  "jwt expired": "Your session has expired. Please sign in again.",
  "token is expired": "Your session has expired. Please sign in again.",
  "no token provided": "Please sign in to watch this video.",
  "token not found": "Please sign in to watch this video.",
  "token is not valid": "Please sign in to watch this video.",
  "forbidden": "You do not have permission to access this content.",
  "subscription required": "A subscription is required to watch this content.",
  "user is not active": "Your account is currently inactive.",
};

/**
 * Checks if the error is an authentication/authorization error.
 */
export const isAuthError = (err: any): boolean => {
  if (!err) return false;
  
  // HTTP status codes indicating authentication/authorization failure
  if (err.response?.status === 401 || err.response?.status === 403) {
    return true;
  }

  const rawMsg = getRawErrorMessage(err).toLowerCase();
  
  return (
    rawMsg.includes("token") ||
    rawMsg.includes("unauthorized") ||
    rawMsg.includes("jwt") ||
    rawMsg.includes("sign in") ||
    rawMsg.includes("log in")
  );
};

/**
 * Extracts the raw message string from any error object.
 */
export const getRawErrorMessage = (err: any): string => {
  if (!err) return "";
  if (typeof err === "string") return err;
  
  if (err.response?.data?.message) {
    const msg = err.response.data.message;
    return Array.isArray(msg) ? msg.join(", ") : String(msg);
  }
  
  return err.message || "";
};

/**
 * Maps a raw error to a friendly message.
 */
export const getFriendlyErrorMessage = (
  err: any,
  fallback = "Failed to retrieve video stream. Please try again later."
): string => {
  if (!err) return fallback;

  // Check HTTP Status code first
  if (err.response?.status === 401) {
    return "Please sign in to watch this video.";
  }
  if (err.response?.status === 403) {
    return "You do not have permission to watch this content. A subscription might be required.";
  }

  const rawMsg = getRawErrorMessage(err);
  if (!rawMsg) return fallback;

  // Check exact mapping or substring mapping
  const lowerMsg = rawMsg.toLowerCase().trim();
  
  for (const [key, friendlyValue] of Object.entries(ERROR_MESSAGE_MAPPING)) {
    if (lowerMsg === key || lowerMsg.includes(key)) {
      return friendlyValue;
    }
  }

  return rawMsg;
};
