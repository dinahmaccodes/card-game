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
            <circle cx="50" cy="50" r="40" fill="currentColor" />
          </svg>
        );
      case "triangle":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,90 10,90" fill="currentColor" />
          </svg>
        );
      case "square":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="20" y="20" width="60" height="60" fill="currentColor" />
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,10 61,35 88,35 67,52 77,78 50,60 23,78 33,52 12,35 39,35"
              fill="currentColor"
            />
          </svg>
        );
      case "cross":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="40" y="10" width="20" height="80" fill="currentColor" />
            <rect x="10" y="40" width="80" height="20" fill="currentColor" />
          </svg>
        );
      case "whot":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "circle":
        return "text-azure";
      case "triangle":
        return "text-jade";
      case "square":
        return "text-amber";
      case "star":
        return "text-amethyst";
      case "cross":
        return "text-rose";
      case "whot":
        return "text-ember-500";
      default:
        return "text-gray-500";
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
        <div className="absolute inset-0 bg-linear-to-br from-ember-600 via-ember-700 to-ember-900 rounded-xl border-2 border-ember-500/30">
          <div className="absolute inset-[3px] bg-linear-to-br from-void-800 to-void-900 rounded-lg flex items-center justify-center">
            <div className="text-ember-500/30 text-2xl font-bold">L</div>
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
          bg-white rounded-xl shadow-2xl overflow-hidden
      relative
      ${
        isPlayable
          ? "cursor-pointer hover:translate-x-6 hover:shadow-2xl"
          : "opacity-100"
      }
      ${isPlayable ? "border-2 border-ember-400" : "border border-gray-300"}
      transition-all duration-200
      ${className}
      `}
    >
      {/* Card Background */}
      {/* Top Corner */}
      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center gap-0.5">
        <div
          className={`text-sm sm:text-lg md:text-xl font-bold ${getSuitColor(
            card.suit
          )}`}
        >
          {card.number}
        </div>
        <div
          className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${getSuitColor(
            card.suit
          )}`}
        >
          {getSuitSVG(card.suit)}
        </div>
      </div>

      {/* Center Symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 ${getSuitColor(
            card.suit
          )}`}
        >
          {getSuitSVG(card.suit)}
        </div>
      </div>

      {/* Bottom Corner (Rotated) */}
      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center gap-0.5 rotate-180">
        <div
          className={`text-sm sm:text-lg md:text-xl font-bold ${getSuitColor(
            card.suit
          )}`}
        >
          {card.number}
        </div>
        <div
          className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${getSuitColor(
            card.suit
          )}`}
        >
          {getSuitSVG(card.suit)}
        </div>
      </div>

      {/* Special Card Indicator */}
      {card.isSpecial && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-ember-500 rounded-full" />
        </div>
      )}
    </div>
  );
};

export default CardComponent;
