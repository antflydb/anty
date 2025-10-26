'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedHeroSectionProps {
  heading: string;
  description: string;
  button: ReactNode;
  subtext?: string;
}

export function AnimatedHeroSection({ heading, description, button, subtext }: AnimatedHeroSectionProps) {
  // Split heading into words
  const words = heading.split(' ');

  // Container animation
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Word animation with very smooth easing
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const, // Smooth, polished easeOutQuad
      },
    },
  };

  // Description line animation - slightly slower, more deliberate
  const descriptionVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  // Button animation - final reveal
  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  // Subtext animation - subtle final touch
  const subtextVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center text-center space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Heading */}
      <h1 className="text-5xl font-bold tracking-tight sm:text-8xl max-w-5xl">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className="inline-block mr-[0.25em] last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Animated Description */}
      <motion.p
        variants={descriptionVariants}
        className="max-w-4xl leading-normal text-muted-foreground sm:text-xl sm:leading-8"
      >
        {description}
      </motion.p>

      {/* Animated Button and Subtext */}
      <div className="flex flex-col items-center gap-8">
        <motion.div variants={buttonVariants}>
          {button}
        </motion.div>

        {/* Subtext below button */}
        {subtext && (
          <motion.p
            variants={subtextVariants}
            className="text-sm text-foreground/35 font-medium"
          >
            {subtext}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
