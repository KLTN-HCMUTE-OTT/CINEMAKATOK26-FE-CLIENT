/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  authControllerResetPassword,
  authControllerResendOtp,
} from "@/apis/api/auth";
import { toast } from "sonner";

function ResetPasswordForm() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authControllerResetPassword({
        email,
        otp,
        newPassword,
      });

      if (response?.data) {
        // Show success message
        toast.success(
          "Password reset successfully! Please login with your new password."
        );

        // Navigate to home page with login modal trigger
        router.push("/?openLogin=true");
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Failed to reset password. Please try again.";

      if (err?.response?.data) {
        const errorData = err.response.data;

        // Check if error is an object with field-specific messages
        if (
          errorData.error &&
          typeof errorData.error === "object" &&
          !Array.isArray(errorData.error)
        ) {
          // Extract all error messages from the error object
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
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const response = await authControllerResendOtp({
        email,
      });

      if (response?.data) {
        // Reset timer
        setResendTimer(60);
        setCanResend(false);
        toast.success("OTP has been resent to your email!");
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Failed to resend OTP. Please try again.";

      if (err?.response?.data) {
        const errorData = err.response.data;

        // Check if error is an object with field-specific messages
        if (
          errorData.error &&
          typeof errorData.error === "object" &&
          !Array.isArray(errorData.error)
        ) {
          // Extract all error messages from the error object
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

      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
          <p className="text-gray-400 text-sm">
            Enter the OTP sent to <span className="text-white">{email}</span>
            <br />
            and create a new password
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              disabled={isLoading}
              className="w-full px-6 py-4 bg-[#1a1d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend}
                className={`text-sm ${
                  canResend
                    ? "text-purple-400 hover:text-purple-300 cursor-pointer"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                {canResend ? "Resend OTP" : `Resend OTP in ${resendTimer}s`}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-6 py-4 bg-[#1a1d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-6 py-4 bg-[#1a1d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1d35] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold">Streamvid</span>
        </Link>
      </header>

      {/* Main Content with Suspense */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
