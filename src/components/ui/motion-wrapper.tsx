'use client';

import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MotionWrapper({
  children,
  className,
  delay = 0,
  ...props
}: MotionWrapperProps) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredMotionProps {
  children: ReactNode[];
  className?: string;
  itemDelay?: number;
}

export function StaggeredMotion({
  children,
  className,
  itemDelay = 0.1,
}: StaggeredMotionProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MotionWrapper key={index} delay={index * itemDelay}>
          {child}
        </MotionWrapper>
      ))}
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}