import React from "react";
import type { CardProps } from "../types/game";

const CardComponent: React.FC<CardProps> = ({
  card,
  isFaceUp = true,
  isPlayable = false,
  onClick,
  className = "",
}) => {
  const getSuitSVG = (suit: string) => {
    switch (suit) {
      case "circle":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient
                id={`shine-circle-${card.number}`}
                cx="30%"
                cy="30%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="currentColor" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill={`url(#shine-circle-${card.number})`}
            />
          </svg>
        );
      case "triangle":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient
                id={`shine-triangle-${card.number}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
            <polygon
              points="50,10 90,90 10,90"
              fill={`url(#shine-triangle-${card.number})`}
            />
          </svg>
        );
      case "square":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient
                id={`shine-square-${card.number}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="60" height="60" fill="currentColor" />
            <rect
              x="20"
              y="20"
              width="60"
              height="60"
              fill={`url(#shine-square-${card.number})`}
            />
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient
                id={`shine-star-${card.number}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points="50,10 61,35 88,35 67,52 77,78 50,60 23,78 33,52 12,35 39,35"
              fill="currentColor"
            />
            <polygon
              points="50,10 61,35 88,35 67,52 77,78 50,60 23,78 33,52 12,35 39,35"
              fill={`url(#shine-star-${card.number})`}
            />
          </svg>
        );
      case "cross":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient
                id={`shine-cross-${card.number}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x="40" y="10" width="20" height="80" fill="currentColor" />
            <rect x="10" y="40" width="80" height="20" fill="currentColor" />
            <rect
              x="40"
              y="10"
              width="20"
              height="80"
              fill={`url(#shine-cross-${card.number})`}
            />
            <rect
              x="10"
              y="40"
              width="80"
              height="20"
              fill={`url(#shine-cross-${card.number})`}
            />
          </svg>
        );
      case "whot":
        return (
          <img
            src="/full symbol.png"
            alt="whot"
            className="w-full h-full object-contain"
          />
        );
      default:
        return null;
    }
  };

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "circle":
        return "text-[#E23A2F]";
      case "triangle":
        return "text-[#E23A2F]";
      case "square":
        return "text-[#E23A2F]";
      case "star":
        return "text-[#E23A2F]";
      case "cross":
        return "text-[#E23A2F]";
      case "whot":
        return "text-[#E23A2F]";
      default:
        return "text-[#E23A2F]";
    }
  };

  // Card Back Design
  if (!isFaceUp) {
    return (
      <div
        className={`
          w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-40
          relative rounded-xl shadow-lg
          ${className}
        `}
      >
        <div className="absolute inset-0 rounded-xl border border-ember-700/30 bg-linear-to-br from-void-800 to-void-900 flex items-center justify-center">
          <div className="w-16 h-16 flex flex-col items-center justify-center">
            <img
              src="/full symbol.png"
              alt="linot"
              className="w-full h-full object-contain"
            />
            <span className="font-titan text-center">Linot</span>
          </div>
        </div>
      </div>
    );
  }

  // Card Front Design
  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-40
        relative font-titan
        ${
          isPlayable
            ? "cursor-pointer hover:translate-x-6 hover:shadow-2xl"
            : "opacity-100"
        }
        transition-all duration-200
        ${className}
      `}
      style={{
        backgroundColor: "#FFFFF9",
        border: "1.82px solid #E23A2F",
        borderRadius: "16px",
        boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
        overflow: "visible",
      }}
    >
      {/* Top Left Corner Tab */}
      <div
        className="absolute -top-0 -left-0 z-30"
        style={{
          width: "25%",
          height: "35%",
          backgroundColor: "#E23A2F",
          borderRadius: "16px 0 16px 0",
          boxShadow: "inset 0px 2px 8px rgba(255, 255, 255, 0.3)",
        }}
      >
        {/* Glossy highlight on tab */}
        <div
          className="absolute top-1 left-1 w-8 h-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 60%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="text-white text-md font-light leading-none">
            {card.number}
          </div>
          <div className="w-4 h-4 sm:w-4 sm:h-4 text-white">
            {getSuitSVG(card.suit)}
          </div>
        </div>
      </div>

      {/* Bottom Right Corner Tab */}
      <div
        className="absolute -bottom-0 -right-0 z-30"
        style={{
          width: "25%",
          height: "35%",
          backgroundColor: "#E23A2F",
          borderRadius: "16px 0 16px 0",
          transform: "rotate(180deg)",
          boxShadow: "inset 0px 2px 8px rgba(255, 255, 255, 0.3)",
        }}
      >
        {/* Glossy highlight on tab */}
        <div
          className="absolute top-1 left-1 w-8 h-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 60%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="text-white text-md font-light leading-none">
            {card.number}
          </div>
          <div className="w-4 h-4 sm:w-5 sm:h-5 text-white">
            {getSuitSVG(card.suit)}
          </div>
        </div>
      </div>

      {/* Glossy highlight effect on card body */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ borderRadius: "16px", overflow: "hidden" }}
      >
        <div
          className="absolute top-0 left-0 w-full h-2/5"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />
      </div>

      {/* Center Symbol */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-14 lg:h-14">
          <div className={`w-full h-full ${getSuitColor(card.suit)}`}>
            {getSuitSVG(card.suit)}
          </div>
          {/* Glossy highlight on center symbol */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50%)",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* Special Card Indicator */}
      {card.isSpecial && (
        <div className="absolute top-1 right-1 z-10">
          <div className="w-2 h-2 bg-ember-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default CardComponent;
