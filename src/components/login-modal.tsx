"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  authControllerLogin,
  authControllerSocialLogin,
} from "@/apis/api/auth";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { saveAuthData } from "@/lib/auth";
import { Portal } from "@/components/ui/portal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  container?: HTMLElement | null;
}

function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  container,
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setError(""); // Clear error when modal opens
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setError("");
      setRememberMe(false);
    }, 300); // Match animation duration
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authControllerLogin({
        email,
        password,
      });

      if (response?.data?.data) {
        const userData = response.data.data;

        // Store auth data using utility function
        saveAuthData({
          accessToken: userData.token.accessToken,
          refreshToken: userData.token.refreshToken,
          user: userData,
        });

        // Show success toast
        toast.success("Login successful! Welcome back.");

        // Dispatch custom event to notify header of login
        window.dispatchEvent(new Event("user-logged-in"));

        // Close modal and redirect
        handleClose();
        router.refresh();
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Invalid email or password";

      if (err?.response?.data) {
        const errorData = err.response.data;

        // Check if account is banned
        if (errorData.code === "BANNED") {
          errorMessage = errorData.message || "Your account has been banned";
        } else if (
          errorData.error &&
          typeof errorData.error === "object" &&
          !Array.isArray(errorData.error)
        ) {
          // Check if error is an object with field-specific messages
          const errorMessages = Object.values(errorData.error).filter(
            (msg) => typeof msg === "string"
          );
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(". ");
          }
        } else {
          // Keep default "Invalid email or password" for other errors
          errorMessage = "Invalid email or password";
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError("");

        // Call authControllerSocialLogin with Google access token
        const response = await authControllerSocialLogin({
          provider: "google",
          accessToken: tokenResponse.access_token,
        });

        if (response?.data?.data) {
          const userData = response.data.data;

          // Store tokens
          localStorage.setItem("accessToken", userData.token.accessToken);
          localStorage.setItem("refreshToken", userData.token.refreshToken);

          // Store user info
          localStorage.setItem("user", JSON.stringify(userData));

          // Show success toast
          toast.success("Login successful! Welcome back.");

          // Dispatch custom event to notify header of login
          window.dispatchEvent(new Event("user-logged-in"));

          // Close modal and redirect
          handleClose();
          router.refresh();
        }
      } catch (err: any) {
        // Handle different error response structures
        let errorMessage = "Google login failed. Please try again.";

        if (err?.response?.data) {
          const errorData = err.response.data;

          // Check if account is banned
          if (errorData.code === "BANNED") {
            errorMessage = errorData.message || "Your account has been banned";
          } else if (
            errorData.error &&
            typeof errorData.error === "object" &&
            !Array.isArray(errorData.error)
          ) {
            // Check if error is an object with field-specific messages
            const errorMessages = Object.values(errorData.error).filter(
              (msg) => typeof msg === "string"
            );
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(". ");
            }
          } else {
            errorMessage =
              errorData.message ||
              errorData.error?.message ||
              errorData.errors?.[0]?.message ||
              errorMessage;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    },
  });

  if (!isOpen) return null;

  return (
    <Portal container={container}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div
          className={`bg-white rounded-2xl w-full max-w-md p-8 relative transition-all duration-300 ${
            isAnimating
              ? "animate-in slide-in-from-top-10 fade-in"
              : "animate-out slide-out-to-top-10 fade-out"
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Welcome Back!
          </h2>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              onClick={() => handleGoogleLogin()}
              variant="outline"
              disabled={isLoading}
              className="w-full border-gray-300 py-3 rounded-xl flex items-center justify-center space-x-3 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700">Continue with Google</span>
            </Button>

            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                onClick={handleClose}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Lost your password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            No registered yet?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Register
            </button>
          </p>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By registering, you agree to Streamvid's{" "}
            <button className="text-purple-600 hover:text-purple-700">
              Terms of Use
            </button>{" "}
            and{" "}
            <button className="text-purple-600 hover:text-purple-700">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </Portal>
  );
}

export { LoginModal };
export default LoginModal;
