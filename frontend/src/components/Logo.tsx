import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${sizeClasses[size]} bg-linear-to-br from-linera-500 to-linera-600 rounded-full flex items-center justify-center shadow-lg ${className}`}
    >
      <span className="text-white font-bold font-display">L</span>
    </motion.div>
  );
};

export default Logo;
