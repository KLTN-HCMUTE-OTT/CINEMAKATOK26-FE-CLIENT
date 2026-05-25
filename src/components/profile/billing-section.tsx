"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { paymentControllerGetHistory } from "@/apis/api/payments";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Calendar, ShoppingBag, CheckCircle, Clock, AlertTriangle, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";

export function BillingSection() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); // Dynamic page size limit

  const { data: paymentsResponse, isLoading, error, isPlaceholderData } = useQuery({
    queryKey: ["payments", "history", page, limit],
    queryFn: async () => {
      const response = await paymentControllerGetHistory({ limit, page });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const payments = paymentsResponse?.data || [];
  const meta = paymentsResponse?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">
            <CheckCircle className="h-3.5 w-3.5" />
            Success
          </span>
        );
      case "pending":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            Pending
          </span>
        );
      case "failed":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
            <HelpCircle className="h-3.5 w-3.5" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="text-center text-slate-400 flex flex-col items-center gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></span>
          <p className="text-sm">Loading billing history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/5 backdrop-blur-xl">
        <div className="text-center text-red-400 flex flex-col items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm font-semibold">Failed to load billing information</p>
          <p className="text-xs text-red-400/60">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-400" />
            Billing & Invoices
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            View your subscription payment history and invoice receipts
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-4">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No payment transactions</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            You haven't made any subscription payments yet. Upgrade to premium to start watching!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Plan / Order ID</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white capitalize">
                      {payment.plan} Plan
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Order: {payment.orderCode}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {formatDate(payment.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    <div>
                      {payment.bankCode ? (
                        <span className="font-semibold text-slate-200">{payment.bankCode}</span>
                      ) : (
                        "VNPAY"
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {payment.cardType || "Online"}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination & Limit Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-white">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-white">
                  {Math.min(page * limit, meta?.totalItems || 0)}
                </span>{" "}
                of <span className="font-semibold text-white">{meta?.totalItems || 0}</span> transactions
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Rows per page:</span>
                <Select
                  value={String(limit)}
                  onValueChange={handleLimitChange}
                  disabled={isPlaceholderData}
                >
                  <SelectTrigger size="sm" className="h-7 w-[70px] border-white/10 bg-white/5 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-slate-200">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || isPlaceholderData}
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        disabled={isPlaceholderData}
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#7C5CFF] to-[#A78BFA] text-white shadow-md shadow-purple-500/25 scale-105"
                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || isPlaceholderData}
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
