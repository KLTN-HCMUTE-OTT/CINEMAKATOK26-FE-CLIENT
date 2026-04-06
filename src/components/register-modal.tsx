"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  authControllerSendRegisterOtp,
  authControllerResendRegisterOtp,
  authControllerRegisterWithOtp,
} from "@/apis/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Portal } from "@/components/ui/portal";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  container?: HTMLElement | null;
}

function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  container,
}: RegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("OTHER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canSendOtp, setCanSendOtp] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setError(""); // Clear error when modal opens
    }
  }, [isOpen]);

  // OTP Timer countdown effect
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && !canSendOtp) {
      setCanSendOtp(true);
    }
  }, [otpTimer, canSendOtp]);

  const handleSendOTP = async () => {
    if (!canSendOtp || isLoading) return;

    // Validate required fields before sending OTP
    if (!name || !email || !password) {
      setError("Please fill in name, email, and password first");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!gender) {
      setError("Please select gender");
      return;
    }

    if (!dateOfBirth) {
      setError("Please select date of birth");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await authControllerSendRegisterOtp({
        name,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      });

      if (response?.data) {
        setOtpSent(true);
        setOtpTimer(60);
        setCanSendOtp(false);
        setError(""); // Clear any previous errors
        toast.success("OTP sent successfully! Please check your email.");
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage = "Failed to send OTP. Please try again.";

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
          // Try to extract message from different possible locations
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
  };

  const handleResendOTP = async () => {
    if (!canSendOtp || isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await authControllerResendRegisterOtp({
        email,
      });

      if (response?.data) {
        setOtpTimer(60);
        setCanSendOtp(false);
        toast.success("OTP resent successfully! Please check your email.");
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

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!otp) {
      setError("Please enter OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authControllerRegisterWithOtp({
        name,
        email,
        password,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        otp,
      });
      if (response?.data?.statusCode === 201) {
        // Show success message
        toast.success(
          "Registration successful! Please login with your credentials."
        );

        // Close modal and switch to login
        handleClose();

        // Wait a bit for the close animation, then switch to login modal
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 400);
      }
    } catch (err: any) {
      // Handle different error response structures
      let errorMessage =
        "Registration failed. Please check your information and try again.";

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      // Reset form
      setName("");
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setDateOfBirth("");
      setGender("OTHER");
      setError("");
      setOtpSent(false);
      setOtpTimer(0);
      setCanSendOtp(true);
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <Portal container={container}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div
          className={`bg-white rounded-2xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto transition-all duration-300 ${
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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Free Account
            </h2>
            <p className="text-gray-500 text-sm">
              It's free. No subscription required
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Set Password"
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

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  placeholder="mm/dd/yy"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label className="text-xs text-gray-400 ml-1 mt-1 block">
                  Date of Birth
                </label>
              </div>
              <div>
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "MALE" | "FEMALE" | "OTHER")
                  }
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <label className="text-xs text-gray-400 ml-1 mt-1 block">
                  Gender
                </label>
              </div>
            </div>

            {/* OTP */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading || !otpSent}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-24 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={otpSent ? handleResendOTP : handleSendOTP}
                disabled={!canSendOtp || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all ${
                  canSendOtp && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading
                  ? "..."
                  : canSendOtp
                  ? otpSent
                    ? "Resend"
                    : "Send"
                  : `${otpTimer}s`}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !otpSent}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Login
            </button>
          </p>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By registering you agree to Streamvid's{" "}
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

export { RegisterModal };
export default RegisterModal;
