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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="card-base p-8">
        <h2 className="font-semibold text-[28px] text-gray-dark leading-page mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-on-light-secondary text-sm leading-[1.43] tracking-caption mb-8">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </motion.div>
  );
}
