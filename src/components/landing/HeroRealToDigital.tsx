import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import heroPhoto from '../../assets/images/hero_banking_phone_1795610956509.jpg';
import { SETTLE_EASE } from '../../animations/scrollSystem';

export function HeroRealToDigital({
  onExploreClick,
  agentName,
}: {
  onExploreClick: () => void;
  agentName: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [stageIndex, setStageIndex] = useState<0 | 1 | 2>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      if (v < 0.34) setStageIndex(0);
      else if (v < 0.7) setStageIndex(1);
      else setStageIndex(2);
    });
    return () => unsub();
  }, [scrollYProgress]);

  // Smooth zoom toward the customer's smartphone hand (52%, 48%)
  const photoScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [1, 1] : [1, 1.18],
  );
  const cardShiftY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [0, -18],
  );

  if (reduced) {
    return (
      <section className="relative border-b border-slate-200 dark:border-slate-800/80 overflow-hidden min-h-[560px] flex items-center">
        <img
          src={heroPhoto}
          alt="Corporate finance customer reviewing a supplier payment on a smartphone"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/82 to-[#F4F7FB]/25 dark:from-[#050914]/96 dark:via-[#050914]/82 dark:to-[#050914]/30" />

        <div className="relative z-10 max-w-[1320px] w-full mx-auto px-6 py-14">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>MANDATE ACTIVE · KNOW YOUR AGENT (KYA)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-semibold tracking-[-0.025em] text-slate-950 dark:text-slate-100 leading-[1.08]">
              The agent is trusted.
            </h1>
            <p className="text-xl font-display font-medium tracking-[-0.015em] text-cyan-700 dark:text-cyan-300 leading-snug">
              <span className="hidden sm:inline">
                But is it still doing
                <br />
                what the customer asked?
              </span>
              <span className="sm:hidden">
                Is the agent
                <br />
                still doing
                <br />
                what the customer asked?
              </span>
            </p>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Meet Mandate Guard. Every agent action is judged against the
              customer&apos;s delegated mandate, so trust attaches to Agent +
              Mandate + Action.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg whitespace-nowrap"
              >
                Enter the Transaction
                <ArrowDown className="w-4 h-4" />
              </button>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1120]/95 rounded-lg text-slate-800 dark:text-slate-200 whitespace-nowrap"
              >
                Flagship ₹1.4L Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative h-auto lg:h-[145vh] border-b border-slate-200 dark:border-slate-800/80"
    >
      <div className="lg:sticky lg:top-16 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden relative flex items-center">
        {/* Full-Bleed Real-Life Photography with Scroll Zoom Toward Smartphone */}
        <motion.div
          style={{ scale: photoScale, transformOrigin: '52% 48%' }}
          className="absolute inset-0 pointer-events-none will-change-transform"
        >
          <img
            src={heroPhoto}
            alt="Finance executive inspecting a supplier payment on a smartphone in a corporate office"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Dual-Theme Editorial Contrast Scrims */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/78 to-[#F4F7FB]/18 dark:from-[#050914]/96 dark:via-[#050914]/76 dark:to-[#050914]/24" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F4F7FB]/85 via-transparent to-transparent dark:from-[#050914]/88 dark:via-transparent dark:to-transparent" />

        {/* Foreground Typography + Emerging Layered Transaction UI */}
        <div className="relative z-10 max-w-[1320px] w-full mx-auto px-6 py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>MANDATE ACTIVE · KYA SECURITY LAYER</span>
            </div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, ease: SETTLE_EASE }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-semibold tracking-[-0.025em] text-slate-950 dark:text-slate-100 leading-[1.06]"
              >
                The agent is trusted.
              </motion.h1>

              <motion.p
                animate={{
                  opacity: stageIndex >= 1 ? 1 : 0.82,
                  y: stageIndex >= 1 ? 0 : 4,
                  filter: stageIndex >= 1 ? 'blur(0px)' : 'blur(0.4px)',
                }}
                transition={{ duration: 0.45, ease: SETTLE_EASE }}
                className={`text-xl sm:text-2xl lg:text-[1.75rem] font-display font-medium tracking-[-0.015em] leading-snug ${
                  stageIndex >= 1
                    ? 'text-cyan-700 dark:text-cyan-300'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="hidden sm:inline">
                  But is it still doing
                  <br />
                  what the customer asked?
                </span>
                <span className="sm:hidden">
                  Is the agent
                  <br />
                  still doing
                  <br />
                  what the customer asked?
                </span>
              </motion.p>
            </div>

            <motion.div
              animate={{
                opacity: stageIndex === 2 ? 1 : 0.9,
                y: stageIndex === 2 ? 0 : 4,
              }}
              transition={{ duration: 0.45, ease: SETTLE_EASE }}
              className="space-y-2 max-w-lg"
            >
              <div className="text-base sm:text-lg font-display font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">
                Meet Mandate Guard.
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Every agent action is judged against the customer&apos;s
                delegated mandate, so trust attaches to{' '}
                <strong className="font-semibold text-slate-950 dark:text-white">
                  Agent + Mandate + Action
                </strong>{' '}
                — not to the agent alone.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
              >
                Enter the Transaction
                <ArrowDown className="w-4 h-4" />
              </button>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1120]/95 text-slate-900 dark:text-slate-200 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
              >
                Run Flagship ₹1.4L Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Layered Transaction Card Emerging From Smartphone Session */}
          <motion.div
            style={{ y: cardShiftY }}
            className="lg:col-span-5 lg:justify-self-end w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 p-5 shadow-lg dark:shadow-none space-y-3.5"
          >
            <div className="flex items-center justify-between gap-3 text-xs font-mono pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                {stageIndex === 0
                  ? '01. SMARTPHONE SESSION'
                  : stageIndex === 1
                    ? '02. CHECKING MANDATE'
                    : '03. PERIMETER VERIFIED'}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                AGENT VERIFIED
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {agentName}
                </div>
                <div className="text-sm font-semibold text-slate-950 dark:text-slate-100 mt-0.5">
                  ABC Industries · Approved Invoice
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-semibold text-slate-950 dark:text-white tabular-nums">
                  ₹85,000
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400">
                  → ••••4412
                </div>
              </div>
            </div>

            {/* Animated 2D Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  animate={{
                    width:
                      stageIndex === 0
                        ? '36%'
                        : stageIndex === 1
                          ? '72%'
                          : '100%',
                  }}
                  transition={{ duration: 0.45, ease: SETTLE_EASE }}
                  className="h-full bg-cyan-600 dark:bg-cyan-400 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Identity</span>
                <span>Mandate MND-8841</span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  {stageIndex === 2 ? 'ALLOW' : 'Checking'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Cue */}
        <div className="hidden lg:flex absolute bottom-4 left-0 right-0 px-6 max-w-[1320px] mx-auto items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pointer-events-none">
          <span>
            {stageIndex === 0
              ? 'Real Person → Smartphone'
              : stageIndex === 1
                ? 'Transaction → Mandate Verification'
                : 'Mandate Perimeter Active'}
          </span>
          <span>Scroll to continue ↓</span>
        </div>
      </div>
    </section>
  );
}
