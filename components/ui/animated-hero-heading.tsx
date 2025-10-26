'use client';

import { motion } from 'framer-motion';

interface AnimatedHeroHeadingProps {
  text: string;
  className?: string;
}

export function AnimatedHeroHeading({ text, className = '' }: AnimatedHeroHeadingProps) {
  // Split text into words
  const words = text.split(' ');

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  // Word animation with smooth easing
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1] as const, // Custom cubic-bezier for smooth, classy motion
      },
    },
  };

  return (
    <motion.h1
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
