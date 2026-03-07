import React from "react";

interface MetricCardsProps {
  stats: {
    cashBalance: number;
    bankBalance: number;
    totalFeesAssigned: number;
    totalFeesCollected: number;
    outstandingFees: number;
    totalExpenses: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);

  const cards = [
    {
      label: "Cash Balance",
      value: stats.cashBalance,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Bank Balance",
      value: stats.bankBalance,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Fees Collected",
      value: stats.totalFeesCollected,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Outstanding Fees",
      value: stats.outstandingFees,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Total Expenses",
      value: stats.totalExpenses,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`p-6 rounded-2xl shadow-sm border border-gray-100 ${card.bg}`}
        >
          <p className="text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
            {card.label}
          </p>
          <p className={`text-2xl font-black ${card.color}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
};
