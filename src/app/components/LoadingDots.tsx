"use client";

import { motion } from "framer-motion";

export default function LoadingDots() {
  const dotVariants = {
    start: { y: 0, opacity: 0.4 },
    end: { y: -4, opacity: 1 },
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-2 w-2 rounded-full bg-white"
          variants={dotVariants}
          initial="start"
          animate="end"
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.6,
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
}

