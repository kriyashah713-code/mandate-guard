import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

export const SETTLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Reusable vertical-scroll-to-horizontal-track component.
 * Vertical scroll inside the outer container moves the inner rail horizontally.
 */
export function HorizontalScrollTrack({
  children,
  className = '',
  trackHeightClass = 'h-[200vh]',
}: {
  children: React.ReactNode;
  className?: string;
  trackHeightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  });
  const x = useTransform(smoothProgress, [0, 1], ['0%', '-52%']);

  if (reduced) {
    return (
      <div className={`py-12 overflow-x-auto ${className}`}>
        <div className="flex gap-6">{children}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${trackHeightClass} ${className}`}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex items-stretch gap-6 px-6">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Thin top scroll progress hairline for long narrative experiences.
 */
export function ScrollProgressRule() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-16 left-0 right-0 h-[2px] bg-cyan-400 origin-left z-50 pointer-events-none"
    />
  );
}

/**
 * Pinned scroll stage that keeps visual context fixed while narrative steps progress.
 */
export function PinnedScrollStage({
  children,
  heightClass = 'min-h-[180vh]',
  className = '',
}: {
  children: React.ReactNode;
  heightClass?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${heightClass} ${className}`}>
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] flex items-center">
        {children}
      </div>
    </div>
  );
}
