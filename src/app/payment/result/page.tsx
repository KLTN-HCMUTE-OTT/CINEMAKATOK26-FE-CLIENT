"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, Receipt, Play } from "lucide-react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");

  const isSuccess = status === "success";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] px-4 py-16 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20">
          
          {/* Status Icon & Header */}
          <div className="flex flex-col items-center text-center">
            {isSuccess ? (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Payment Successful!
                </h2>
                <p className="mt-3 text-slate-400 text-sm md:text-base leading-relaxed">
                  Thank you for your purchase. Your subscription has been activated and you are ready to stream!
                </p>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-10 h-10" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Payment Failed
                </h2>
                <p className="mt-3 text-slate-400 text-sm md:text-base leading-relaxed">
                  We couldn't process your transaction. Please try again or contact your bank.
                </p>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="mt-8 border-t border-white/5 pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Order Code</span>
                <span className="font-mono text-white bg-white/5 px-2.5 py-1 rounded-md text-xs border border-white/10 select-all">
                  {orderCode || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isSuccess 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-rose-400"}`} />
                  {isSuccess ? "SUCCESS" : "FAILED"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            {isSuccess ? (
              <>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Watching</span>
                </Link>
                <Link
                  href="/profile/billing"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-3.5 text-sm font-semibold text-white border border-white/10 transition-all duration-300 hover:bg-white/10"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View Billing History</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25"
                >
                  <span>Try Again</span>
                </Link>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-3.5 text-sm font-semibold text-white border border-white/10 transition-all duration-300 hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go to Homepage</span>
                </Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
