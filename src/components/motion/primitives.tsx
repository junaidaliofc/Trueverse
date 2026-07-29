"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: easeOut } }
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } }
};

export function MotionPage({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={stagger}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div className={cn(className)} variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionCard({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      variants={fadeUp}
      whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
