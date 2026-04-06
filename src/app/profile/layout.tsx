"use client";

import { ProtectedRoute } from "@/components/protected-route";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1326]">{children}</div>
    </ProtectedRoute>
  );
}
