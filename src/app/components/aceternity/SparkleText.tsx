"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface SparklesTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export default function SparklesText({
  children,
  className,
  gradient = false,
}: SparklesTextProps) {
  // Removed GSAP animation and replaced with motion
  const renderChildren = () => {
    if (typeof children === "string") {
      return (
        <motion.span
          className="text-[#C277FF] font-medium"
          initial="initial"
          animate="animate"
          variants={{}}
          transition={{
            staggerChildren: 0.2,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ display: "inline-block" }}
        >
          {children.split("").map((char, idx) => (
            <motion.span
              key={idx}
              className="inline-block sparkle-letter"
              variants={{
                initial: { scale: 0.95, opacity: 1 },
                animate: { scale: [0.95,0.96,0.97,0.98,0.99,1.0,1.1,1.0,0.99,0.98,0.97,0.96,0.95], opacity: 1 },
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      );
    }
    return children;
  };


  return (
    <div
      className={`relative inline-block font-bold ${
        gradient
          ? ""
          : ""
      } ${className || ""}`}
    >
      {renderChildren()}
    </div>
  );
}
