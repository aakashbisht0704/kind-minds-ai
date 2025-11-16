// app/components/PageTransitionWrapper.tsx
'use client'

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function PageTransitionWrapper({ children } : { children : React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{
    x: 0,
    y:0,
    opacity: 1,
    transition: {
      default: { type: "spring" },
      opacity: { ease: "linear" }
    }
  }}
      exit={{ opacity: 0, y: -10 }}
      className="pt-40"
    >
      {children}
    </motion.div>
  );
}