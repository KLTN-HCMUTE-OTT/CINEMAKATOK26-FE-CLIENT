"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface LoadingErrorWrapperProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function LoadingErrorWrapper({
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No data available.",
  children,
}: LoadingErrorWrapperProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute">
                <Spinner className="w-16 h-16 text-purple-400 opacity-25 animate-ping" />
              </div>
              <Spinner className="w-16 h-16 text-purple-300 drop-shadow-lg" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-purple-100">
                Loading in progress...
              </p>
              <div className="flex items-center justify-center space-x-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-32">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-32">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>{emptyMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
