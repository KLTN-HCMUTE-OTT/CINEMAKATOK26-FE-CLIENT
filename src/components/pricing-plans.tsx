"use client";

import { useState } from "react";
import { useUIStore } from "@/store";
import { isAuthenticated } from "@/lib/auth";
import { paymentControllerInitiateSubscription } from "@/apis/api/payments";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PricingPlans() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  const plans = [
    {
      name: "Premium Plan",
      planType: "premium" as const,
      price: "$9.99",
      duration: "/ 2 Months",
      features: [
        "Unlimited access to thousands of movies and TV shows",
        "Watch seamlessly on all your favorite devices",
        "Cancel or switch plans anytime you want",
        "HD streaming with fast playback experience",
      ],
      buttonText: "Get Started",
      highlighted: true,
    },
  ];

  const handleSubscribe = async (planType: "basic" | "premium") => {
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }

    try {
      setLoadingPlan(planType);
      const res = await paymentControllerInitiateSubscription({ plan: planType });
      const paymentUrl = res.data?.data?.paymentUrl;
      console.log(paymentUrl);
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Subscription payment error:", err);
      toast.error("Failed to initiate subscription payment.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#020617] px-6 py-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-medium text-purple-300">
            Pricing Plans
          </span>

          <h2 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Perfect Plan
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
            Enjoy premium entertainment with unlimited access to movies,
            series, and exclusive content — all in one affordable plan.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-md">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Popular Badge */}
              <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                MOST POPULAR
              </div>

              <div className="relative z-10">
                {/* Plan Info */}
                <div className="mb-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                    {plan.name}
                  </p>

                  <div className="flex items-end gap-2">
                    <h3 className="text-5xl font-bold text-white">
                      {plan.price}
                    </h3>

                    <span className="mb-1 text-slate-400">
                      {plan.duration}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-10 space-y-5">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-4"
                    >
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm text-white">
                        ✓
                      </div>

                      <span className="text-sm leading-relaxed text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleSubscribe(plan.planType)}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingPlan === plan.planType && (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  )}
                  <span>{plan.buttonText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}