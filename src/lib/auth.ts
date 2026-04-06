/**
 * Authentication utilities
 * Helper functions to check authentication status
 */

/**
 * Check if user is authenticated (has valid token)
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("accessToken");
  return !!token;
}

/**
 * Get current user from localStorage
 * @returns user object or null
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Get access token from localStorage
 * @returns token string or null
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Save auth data to localStorage
 */
export function saveAuthData(data: {
  accessToken: string;
  refreshToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

/**
 * Update user data in localStorage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateUserInLocalStorage(userData: any): void {
  if (typeof window === "undefined") return;

  try {
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("user-updated"));
  } catch (error) {
    console.error("Failed to update user in localStorage:", error);
  }
}
