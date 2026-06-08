"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Redirects to home page if user is not authenticated
 */
export function ProtectedRoute({
  children,
  fallbackUrl = "/?openLogin=true",
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        toast.error("Please log in to access this page", {
          duration: 3000,
        });

        // Delay redirect to allow toast to show
        setTimeout(() => {
          router.push(fallbackUrl);
        }, 500);

        // *** KHÔNG GỌI setIsChecking(false) Ở ĐÂY NỮA ***
        // Cứ để màn hình loading hiển thị, router.push sẽ lo phần còn lại.
      } else {
        // Chỉ tắt loading và cho phép render khi người dùng hợp lệ
        setIsAuthorized(true);
        setIsChecking(false);
      }

      // *** BỎ DÒNG setIsChecking(false); Ở CUỐI HÀM (NẾU CÓ) ***
    };

    checkAuth();
  }, [router, fallbackUrl]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authorized, return null (will redirect)
  if (!isAuthorized) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
