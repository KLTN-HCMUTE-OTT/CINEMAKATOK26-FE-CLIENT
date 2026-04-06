"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authControllerForgotPassword } from "@/apis/api/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authControllerForgotPassword({
        email,
      });

      if (response?.data) {
        // Show success message
        toast.success("OTP sent successfully! Please check your email.");

        // Navigate to OTP verification page
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Failed to send reset email. Please try again.";

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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Lost password
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Lost your password? Please enter your username or email address.
              <br />
              You will receive a link to create a new password via email.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-6 py-4 bg-[#1a1d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Reset password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
