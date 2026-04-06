"use client";

export function PricingPlans() {
  const plans = [
    {
      name: "FREE PLAN",
      price: "Free.",
      features: [
        "Get unlimited access to thousands of shows and movies with limited ads",
        "Watch on your favorite devices",
        "Switch plans or cancel anytime",
        "Download from thousands of titles to watch offline",
      ],
      buttonText: "Choose Plan",
      highlighted: false,
    },
    {
      name: "DIAMOND PLAN",
      price: "$9.99 per Month.",
      features: [
        "Get unlimited access to thousands of shows and movies with limited ads",
        "Watch on your favorite devices",
        "Switch plans or cancel anytime",
        "Download from thousands of titles to watch offline",
      ],
      buttonText: "Choose Plan",
      highlighted: true,
    },
    {
      name: "PLATINUM PLAN",
      price: "$39.99 every 2 Months.",
      features: [
        "Get unlimited access to thousands of shows and movies with limited ads",
        "Watch on your favorite devices",
        "Switch plans or cancel anytime",
        "Download from thousands of titles to watch offline",
      ],
      buttonText: "Choose Plan",
      highlighted: false,
    },
  ];

  return (
    <section className="px-6 py-16 bg-slate-900/50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-white text-4xl font-bold mb-4">
          Choose The Plan That
          <br />
          Suits For You
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          We present 3 packages that you can choose to start watching various
          movies you like at low prices and according to your needs
        </p>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border flex flex-col h-full ${
                plan.highlighted
                  ? "bg-slate-800 border-slate-700 shadow-xl shadow-purple-500/10"
                  : "bg-slate-800/30 border-slate-700/50"
              }`}
            >
              <div className="mb-6 min-h-[100px] flex flex-col justify-start">
                <p className="text-gray-400 text-sm font-medium mb-2">
                  {plan.name}
                </p>
                <h3 className="text-purple-400 text-3xl font-bold">
                  {plan.price}
                </h3>
              </div>

              <ul className="space-y-4 mb-8 text-left flex-grow min-h-[240px]">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30"
                    : "border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
