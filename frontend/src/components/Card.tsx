import React from "react";
import { motion } from "framer-motion";
import type { CardProps } from "../types/game";

const CardComponent: React.FC<CardProps> = ({
  card,
  isFaceUp = true,
  isPlayable = false,
  onClick,
  className = "",
}) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "circle":
        return "●";
      case "triangle":
        return "▲";
      case "square":
        return "■";
      case "star":
        return "★";
      case "cross":
        return "✚";
      case "whot":
        return "W";
      default:
        return "?";
    }
  };

  const getSuitColor = (suit: string) => {
    switch (suit) {
      case "circle":
        return "text-linera-500";
      case "triangle":
        return "text-linera-900";
      case "square":
        return "text-accent-green";
      case "star":
        return "text-accent-yellow";
      case "cross":
        return "text-accent-purple";
      case "whot":
        return "text-linera-600";
      default:
        return "text-gray-500";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -90 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      y: -20,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  if (!isFaceUp) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={`
          w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-44
          bg-linear-to-br from-dark-800 to-dark-900 
          border-2 border-linera-500 rounded-xl shadow-lg
          flex items-center justify-center
          ${className}
        `}
      >
        <div className="text-linera-500 text-2xl sm:text-3xl md:text-4xl font-bold">
          ?
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={isPlayable ? "hover" : undefined}
      whileTap={isPlayable ? "tap" : undefined}
      onClick={isPlayable ? onClick : undefined}
      className={`
        w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-44
        bg-white rounded-xl shadow-lg border-2
        flex flex-col items-center justify-between p-2 sm:p-3
        ${
          isPlayable
            ? "cursor-pointer border-linera-500 hover:border-linera-400 hover:shadow-2xl"
            : "border-gray-300 opacity-50"
        }
        ${className}
      `}
    >
      {/* Top-left number and suit */}
      <div className="flex flex-col items-start w-full">
        <div
          className={`text-xs sm:text-sm md:text-base font-bold ${getSuitColor(
            card.suit
          )}`}
        >
          {card.number}
        </div>
        <div className={`text-xs sm:text-sm ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>

      {/* Center suit symbol */}
      <div
        className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${getSuitColor(
          card.suit
        )}`}
      >
        {getSuitSymbol(card.suit)}
      </div>

      {/* Bottom-right number and suit (rotated) */}
      <div className="flex flex-col items-end w-full transform rotate-180">
        <div
          className={`text-xs sm:text-sm md:text-base font-bold ${getSuitColor(
            card.suit
          )}`}
        >
          {card.number}
        </div>
        <div className={`text-xs sm:text-sm ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>

      {/* Special card indicator */}
      {card.isSpecial && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-linera-500 rounded-full"></div>
      )}
    </motion.div>
  );
};

export default CardComponent;
