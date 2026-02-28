"use client";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-1.5 ${sizes[size]}`}>
      <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 text-white"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      </div>
      <div className="flex items-baseline">
        <span className="font-bold text-gray-900 tracking-tight">
          CarteImmo
        </span>
        <span className="font-bold text-blue-600 tracking-tight">
          Martinique
        </span>
      </div>
    </div>
  );
}
