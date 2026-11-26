import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

export interface CinematicPhotoFrameProps {
  src: string;
  alt: string;
  heightClass?: string;
  zoomRange?: [number, number];
  parallaxY?: [number, number];
  focalOrigin?: string;
  scrimClassName?: string;
  lazy?: boolean;
  children?: React.ReactNode;
}

/**
 * Pure 2D editorial photography container with scroll-driven zoom, subtle vertical
 * parallax, dual-theme contrast scrims, and layered depth shadows (zero WebGL/3D).
 */
export function CinematicPhotoFrame({
  src,
  alt,
  heightClass = 'h-[420px] sm:h-[480px]',
  zoomRange = [1, 1.09],
  parallaxY = [-14, 14],
  focalOrigin = '50% 45%',
  scrimClassName = 'bg-gradient-to-r from-[#F4F7FB]/95 via-[#F4F7FB]/70 to-transparent dark:from-[#050914]/94 dark:via-[#050914]/68 dark:to-transparent',
  lazy = true,
  children,
}: CinematicPhotoFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [1, 1] : zoomRange,
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : parallaxY,
  );

  return (
    <div
      ref={ref}
      className={`relative w-full ${heightClass} rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#070C1A] overflow-hidden shadow-md dark:shadow-none`}
    >
      <motion.div
        style={{ scale, y, transformOrigin: focalOrigin }}
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        <img
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div className={`pointer-events-none absolute inset-0 ${scrimClassName}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A]/45 via-transparent to-transparent dark:from-[#050914]/65 dark:via-transparent dark:to-transparent" />

      {children}
    </div>
  );
}
