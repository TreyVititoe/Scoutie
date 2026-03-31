"use client";

import { motion } from "framer-motion";

export default function StepWrapper({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <h2 className="text-3xl sm:text-4xl font-display font-bold text-text mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-lg mb-8">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </motion.div>
  );
}
