'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedHeroSectionProps {
  heading: string;
  description: string;
  button: ReactNode;
  subtext?: ReactNode;
}

export function AnimatedHeroSection({ heading, description, button, subtext }: AnimatedHeroSectionProps) {
  // Split heading into two parts: "The easy answer bar" and "for every question."
  const firstLine = "The easy answer bar";
  const secondLine = "for every question.";

  // Split into words for animation
  const firstLineWords = firstLine.split(' ');
  const secondLineWords = secondLine.split(' ');

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
      className="flex flex-col items-center text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Heading - Two Lines */}
      <div className="mb-8">
        {/* First line - normal text, stays on one line */}
        <h1 className="text-[48px] md:text-[70px] lg:text-[94px] font-bold leading-[1] mb-0 whitespace-nowrap" style={{ fontFamily: 'Aeonik, sans-serif', color: 'var(--home-primary-text)' }}>
          {firstLineWords.map((word, index) => (
            <motion.span
              key={`first-${word}-${index}`}
              variants={wordVariants}
              className="inline-block mr-[0.25em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Second line - gradient text, animated as whole line to preserve gradient */}
        <motion.h1
          variants={wordVariants}
          className="text-[48px] md:text-[70px] lg:text-[94px] font-bold leading-[1.15] whitespace-nowrap"
          style={{
            fontFamily: 'Aeonik, sans-serif',
            background: 'linear-gradient(to right, var(--home-gradient-blue), var(--home-gradient-purple), var(--home-gradient-pink), var(--home-gradient-orange))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            paddingBottom: '4px' // Extra padding to prevent descender clipping
          }}
        >
          {secondLine}
        </motion.h1>
      </div>

      {/* Animated Description - 24px text with smart line break */}
      <motion.p
        variants={descriptionVariants}
        className="text-[18px] md:text-[20px] lg:text-[24px] leading-[1.56] mb-12 max-w-[758px]"
        style={{ color: 'var(--home-muted-text)' }}
      >
        Your customers don&apos;t search stores like they used to.
        <br className="hidden lg:block" />
        {' '}Give them instant answers, not search results.
      </motion.p>

      {/* Animated Button and Subtext */}
      <div className="flex flex-col items-center gap-8">
        <motion.div variants={buttonVariants}>
          {button}
        </motion.div>

        {/* Subtext below button */}
        {subtext && (
          <motion.div
            variants={subtextVariants}
          >
            {subtext}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
