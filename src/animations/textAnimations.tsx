import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SETTLE_EASE } from './scrollSystem';

export function FadeRise({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: SETTLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MaskReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
        whileInView={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, delay, ease: SETTLE_EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function AnimatedText({
  children,
  active = true,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  active?: boolean;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0.18,
        y: active ? 0 : 12,
        filter: active ? 'blur(0px)' : 'blur(4px)',
      }}
      transition={{ duration: 0.5, delay, ease: SETTLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function WordStagger({
  text,
  className = '',
  highlightWords = [],
  highlightClassName = 'text-cyan-700 dark:text-cyan-300',
}: {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
}) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {words.map((word, idx) => {
        const clean = word.replace(/[^a-zA-Z0-9₹.-]/g, '').toLowerCase();
        const isHighlighted = highlightWords.some(
          (w) => w.toLowerCase() === clean,
        );
        return (
          <React.Fragment key={`${word}-${idx}`}>
            <motion.span
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.45,
                delay: idx * 0.04,
                ease: SETTLE_EASE,
              }}
              className={`inline-block ${isHighlighted ? highlightClassName : ''}`}
            >
              {word}
            </motion.span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </span>
  );
}

export function CharacterEmphasis({
  prefix,
  emphasis,
  suffix = '',
  emphasisClassName = 'text-cyan-700 dark:text-cyan-400',
  className = '',
}: {
  prefix: string;
  emphasis: string;
  suffix?: string;
  emphasisClassName?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <span className={className}>
      {prefix}{' '}
      <motion.span
        initial={reduced ? undefined : { opacity: 0.4, scale: 0.97 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: SETTLE_EASE }}
        className={`inline-block font-semibold ${emphasisClassName}`}
      >
        {emphasis}
      </motion.span>
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

export function MorphingStatement({
  statements,
  activeIndex,
  className = '',
}: {
  statements: string[];
  activeIndex: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const current = statements[Math.min(activeIndex, statements.length - 1)];

  return (
    <div className={`relative min-h-[3.5rem] flex items-center ${className}`}>
      <motion.div
        key={current}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: SETTLE_EASE }}
      >
        {current}
      </motion.div>
    </div>
  );
}
