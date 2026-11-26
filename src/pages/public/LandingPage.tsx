import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll } from 'motion/react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-react';
import heroPhoto from '../../assets/images/hero_banking_phone_1795610956509.jpg';
import invoicePhoto from '../../assets/images/business_owner_invoice_1795610957593.jpg';
import { PublicLayout } from '../../components/PublicLayout';
import { MandateDiff } from '../../components/MandateDiff';
import { HeroRealToDigital } from '../../components/landing/HeroRealToDigital';
import { CoreTriadSpatial } from '../../components/landing/CoreTriadSpatial';
import { OperationalStream } from '../../components/landing/OperationalStream';
import { BehavioralDriftViz } from '../../components/landing/BehavioralDriftViz';
import { CinematicPhotoFrame } from '../../components/landing/CinematicPhotoFrame';
import { TransactionPipeline2D } from '../../components/landing/TransactionPipeline2D';
import {
  AnalystConsoleSection,
  CustomerStepUpSection,
} from '../../components/landing/RealLifeToConsoleBridge';
import {
  ScrollProgressRule,
  SETTLE_EASE,
} from '../../animations/scrollSystem';
import { FadeRise, MaskReveal } from '../../animations/textAnimations';
import { useAppState } from '../../context/AppStateContext';
import type { DecisionState } from '../../types/domain';

interface InterceptionBeat {
  id: number;
  phase: string;
  label: string;
  decision: DecisionState;
  hasViolation: boolean;
  amountInr: number;
  requestedAccount: string;
  streamStep: number;
}

const INTERCEPTION_BEATS: InterceptionBeat[] = [
  {
    id: 0,
    phase: 'NORMAL SPEED',
    label: '01 · Baseline Trajectory (₹85,000 → ••••4412)',
    decision: 'ALLOW',
    hasViolation: false,
    amountInr: 85000,
    requestedAccount: '••••4412',
    streamStep: 2,
  },
  {
    id: 1,
    phase: 'APPROACH → SLOW DOWN',
    label: '02 · Destination Changes (••••4412 → ••••9087)',
    decision: 'HOLD',
    hasViolation: true,
    amountInr: 140000,
    requestedAccount: '••••9087',
    streamStep: 4,
  },
  {
    id: 2,
    phase: 'BOUNDARY RESPONSE → FREEZE → HOLD',
    label: '03 · Transaction Stopped Before Settlement',
    decision: 'HOLD',
    hasViolation: true,
    amountInr: 140000,
    requestedAccount: '••••9087',
    streamStep: 6,
  },
];

const MANDATE_ATTRIBUTES = [
  { label: 'Purpose', value: 'Supplier Payments', tone: 'normal' as const },
  { label: 'Amount', value: 'Up to ₹2,00,000', tone: 'normal' as const },
  {
    label: 'Payees',
    value: 'Registered Suppliers (ABC Industries)',
    tone: 'normal' as const,
  },
  {
    label: 'Destination',
    value: 'Registered Accounts (••••4412)',
    tone: 'accent' as const,
  },
  { label: 'Frequency', value: 'Approved Invoices', tone: 'normal' as const },
];

const DECISION_LAYERS = [
  {
    step: 'AUTHORITY',
    status: 'BOUNDARY CHECK TRIGGERED',
    detail:
      'Agent identity (mTLS) and ceiling (₹1,40,000 ≤ ₹2,00,000) pass, but destination ••••9087 is absent from Mandate MND-8841.',
    tone: 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40',
  },
  {
    step: 'FIDELITY',
    status: '14 / 100 · FAIL',
    detail:
      'Purpose and payee match, yet destination account fidelity fails immediately.',
    tone: 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40',
  },
  {
    step: 'BEHAVIOR',
    status: 'DRIFT DETECTED · 78 / 100',
    detail:
      'External invoice attachment modified beneficiary routing mid-session.',
    tone: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
  },
  {
    step: 'EXPOSURE',
    status: '₹1,40,000 · IRREVERSIBLE',
    detail: 'High-value NEFT/IMPS disbursement risk to unregistered account.',
    tone: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
  },
  {
    step: 'EXPECTED COST',
    status: 'HIGH · E[Loss] > E[Friction]',
    detail:
      'Hard authority rule prevents high Agent Trust (92/100) from overriding mismatch.',
    tone: 'text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40',
  },
  {
    step: 'DECISION',
    status: 'HOLD',
    detail:
      'Payment frozen prior to release; customer verification challenge dispatched.',
    tone: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40',
  },
];

const INTERCEPTION_STEPS = [
  'NORMAL SPEED',
  'APPROACH',
  'SLOW DOWN',
  'BOUNDARY RESPONSE',
  'FREEZE',
  'HOLD — PRE-SETTLEMENT FREEZE',
];

export function LandingPage() {
  const { mandates, transactions, agents } = useAppState();
  const reduced = useReducedMotion();

  const flagshipMandate = mandates[0];
  const flagshipTx =
    transactions.find((t) => t.id === 'TX-2026-0041') || transactions[0];
  const flagshipAgent = agents[0];

  const trustSectionRef = useRef<HTMLDivElement | null>(null);
  const interceptionRef = useRef<HTMLDivElement | null>(null);
  const decisionPathRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: interceptionProgress } = useScroll({
    target: interceptionRef,
    offset: ['start center', 'end center'],
  });

  const { scrollYProgress: decisionProgress } = useScroll({
    target: decisionPathRef,
    offset: ['start center', 'end center'],
  });

  const [beatIdx, setBeatIdx] = useState(0);
  const [interceptVal, setInterceptVal] = useState(0);
  const [activeLayerIdx, setActiveLayerIdx] = useState(0);
  const [stepUpOutcome, setStepUpOutcome] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending');

  useEffect(() => {
    const unsub1 = interceptionProgress.on('change', (v) => {
      setInterceptVal(v);
      const idx = Math.min(
        INTERCEPTION_BEATS.length - 1,
        Math.max(0, Math.floor(v * INTERCEPTION_BEATS.length)),
      );
      setBeatIdx(idx);
    });
    const unsub2 = decisionProgress.on('change', (v) => {
      const idx = Math.min(
        DECISION_LAYERS.length - 1,
        Math.max(0, Math.floor(v * DECISION_LAYERS.length)),
      );
      setActiveLayerIdx(idx);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [interceptionProgress, decisionProgress]);

  const beat = INTERCEPTION_BEATS[beatIdx];
  const activeDecision: DecisionState =
    stepUpOutcome === 'rejected'
      ? 'BLOCK'
      : stepUpOutcome === 'approved'
        ? 'ALLOW'
        : beat.decision;

  const activeSequenceStep = Math.min(
    INTERCEPTION_STEPS.length - 1,
    Math.floor(interceptVal * INTERCEPTION_STEPS.length),
  );

  return (
    <PublicLayout>
      <ScrollProgressRule />

      {/* 1. REAL-LIFE TO DIGITAL CINEMATIC 2D HERO */}
      <HeroRealToDigital
        agentName={flagshipAgent.name}
        onExploreClick={() =>
          trustSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      />

      {/* 2. TRUST IS NOT ENOUGH + THE CUSTOMER'S MANDATE (EDITORIAL 2D PHOTOGRAPHY) */}
      <section
        ref={trustSectionRef}
        className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070C1A] py-14 lg:py-16 px-6"
      >
        <div className="max-w-[1320px] mx-auto space-y-14">
          {/* Trust Is Not Enough */}
          <CinematicPhotoFrame
            src={heroPhoto}
            alt="Authenticated customer reviewing mobile banking transaction"
            zoomRange={[1, 1.1]}
            focalOrigin="52% 45%"
            heightClass="h-[500px] sm:h-[460px]"
            scrimClassName="bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/76 to-transparent dark:from-[#050914]/95 dark:via-[#050914]/72 dark:to-transparent"
          >
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-white/95 dark:bg-[#050914]/90 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-semibold">
                  VERIFIED · mTLS
                </span>
                <span className="px-2.5 py-1 rounded bg-white/95 dark:bg-[#050914]/90 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-semibold">
                  AUTHENTICATED
                </span>
                <span className="px-2.5 py-1 rounded bg-white/95 dark:bg-[#050914]/90 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 font-semibold">
                  TRUSTED · 92/100
                </span>
              </div>

              <div className="max-w-xl space-y-3">
                <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                  TRUST IS NOT ENOUGH
                </div>
                <MaskReveal>
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100 leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    An authenticated agent can still do something the customer
                    never asked for.
                  </h2>
                </MaskReveal>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
                  Identity and session trust only verify who the agent is —
                  never whether this specific payment matches what the customer
                  delegated.
                </p>
              </div>
            </div>
          </CinematicPhotoFrame>

          {/* The Customer's Mandate */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                  THE CUSTOMER&apos;S MANDATE
                </div>
                <h2 className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100">
                  Every permitted boundary is explicit before the agent runs.
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Mandate Perimeter MND-8841 · Supplier Payments
              </span>
            </div>

            <CinematicPhotoFrame
              src={invoicePhoto}
              alt="Business director reviewing approved supplier invoices"
              zoomRange={[1, 1.09]}
              focalOrigin="58% 45%"
              heightClass="h-[510px] sm:h-[460px]"
              scrimClassName="bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/74 to-transparent dark:from-[#050914]/95 dark:via-[#050914]/70 dark:to-transparent"
            >
              <div className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-10">
                <div className="w-full max-w-md space-y-3">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Arvind Mehta&apos;s approval compiles into explicit rules
                    checked before any transfer clears:
                  </p>
                  <dl className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono overflow-hidden shadow-lg dark:shadow-none">
                    {MANDATE_ATTRIBUTES.map((attr, idx) => (
                      <motion.div
                        key={attr.label}
                        initial={reduced ? false : { opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{
                          duration: 0.35,
                          delay: idx * 0.06,
                          ease: SETTLE_EASE,
                        }}
                        className="px-4 py-2.5 flex justify-between gap-4"
                      >
                        <dt className="text-slate-500 dark:text-slate-400 uppercase">
                          {attr.label}
                        </dt>
                        <dd
                          className={
                            attr.tone === 'accent'
                              ? 'text-emerald-700 dark:text-emerald-400 font-semibold text-right'
                              : 'text-slate-950 dark:text-slate-100 font-medium text-right'
                          }
                        >
                          {attr.value}
                        </dd>
                      </motion.div>
                    ))}
                  </dl>
                </div>
              </div>
            </CinematicPhotoFrame>
          </div>
        </div>
      </section>

      {/* 3. CORE CONCEPT (AGENT + MANDATE + ACTION) & REAL TRANSACTION JOURNEY */}
      <CoreTriadSpatial />

      {/* 4. SUSPICIOUS TRANSACTION & ANIMATED 2D PRE-SETTLEMENT INTERCEPTION */}
      <section
        ref={interceptionRef}
        className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060B17] py-14 lg:py-16"
      >
        <div className="max-w-[1320px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Compact Narrative Steps (ZERO blank vertical gaps) */}
          <div className="lg:col-span-5 space-y-5">
            <button
              type="button"
              onClick={() => setBeatIdx(0)}
              className={`w-full text-left p-5 rounded-xl border transition-colors space-y-2 ${
                beatIdx === 0
                  ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-[#0B1120]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080D1A] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                01. Normal Baseline (#1 – #40)
              </div>
              <h2 className="text-2xl font-display font-semibold tracking-[-0.015em] text-slate-950 dark:text-slate-100">
                ₹85,000 → ABC Industries → ••••4412
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Routine supplier payments pass through the verification gate
                without friction when agent, mandate, and destination match.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setBeatIdx(1)}
              className={`w-full text-left p-5 rounded-xl border transition-colors space-y-3 ${
                beatIdx === 1
                  ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50/40 dark:bg-[#0B1120]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080D1A] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-mono text-amber-700 dark:text-amber-300">
                02. The Hijacked Invoice (#41)
              </div>
              <h2 className="text-2xl font-display font-semibold tracking-[-0.015em] text-slate-950 dark:text-slate-100">
                Every standard check passes —{' '}
                <span className="text-red-600 dark:text-red-400">
                  except the account.
                </span>
              </h2>
              <div className="pt-2 space-y-1.5 font-mono text-xs border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Agent
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    VERIFIED ✓
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Amount (₹1,40,000)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    WITHIN LIMIT ✓
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Supplier (ABC Industries)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    MATCH ✓
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Registered
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    ••••4412
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    Requested Destination
                  </span>
                  <span className="text-red-700 dark:text-red-400 font-semibold">
                    ••••9087 · MANDATE MISMATCH ✕
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setBeatIdx(2)}
              className={`w-full text-left p-5 rounded-xl border transition-colors space-y-3 ${
                beatIdx === 2
                  ? 'border-red-400 dark:border-red-500/50 bg-red-50/40 dark:bg-[#0B1120]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080D1A] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-mono text-red-700 dark:text-red-400">
                03. Transaction Interception
              </div>
              <h2 className="text-2xl font-display font-semibold tracking-[-0.015em] text-slate-950 dark:text-slate-100">
                Stopped prior to settlement.
              </h2>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070C1A] divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs overflow-hidden">
                {INTERCEPTION_STEPS.map((label, i) => {
                  const reached = reduced ? true : i <= activeSequenceStep;
                  const isCurrent = !reduced && i === activeSequenceStep;
                  return (
                    <div
                      key={label}
                      className={`px-3.5 py-2 flex items-center justify-between transition-opacity duration-300 ${
                        reached ? 'opacity-100' : 'opacity-40'
                      } ${
                        isCurrent
                          ? 'bg-amber-50/70 dark:bg-amber-950/25'
                          : ''
                      }`}
                    >
                      <span
                        className={
                          i === INTERCEPTION_STEPS.length - 1
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : isCurrent
                              ? 'text-amber-700 dark:text-amber-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-300'
                        }
                      >
                        0{i + 1} · {label}
                      </span>
                      <span className="text-slate-400">
                        {reached ? 'ACTIVE' : 'READY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </button>
          </div>

          {/* Right Pinned Animated 2D Verification Pipeline + Live Event Log */}
          <div className="lg:col-span-7 lg:sticky lg:top-20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                {beat.phase}
              </span>
              <div className="flex items-center gap-1.5">
                {INTERCEPTION_BEATS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBeatIdx(i)}
                    aria-label={b.label}
                    className={`h-1.5 rounded-full transition-all ${
                      beatIdx === i
                        ? 'w-7 bg-cyan-600 dark:bg-cyan-400'
                        : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            <TransactionPipeline2D
              decision={activeDecision}
              hasViolation={
                stepUpOutcome === 'approved' ? false : beat.hasViolation
              }
              amountInr={beat.amountInr}
              agentName={flagshipAgent.name}
              registeredAccount="••••4412"
              requestedAccount={beat.requestedAccount}
              payee="ABC Industries"
              phaseLabel={beat.label}
            />

            <OperationalStream
              activeStep={stepUpOutcome !== 'pending' ? 8 : beat.streamStep}
              customerOutcome={stepUpOutcome}
            />
          </div>
        </div>
      </section>

      {/* 5. MANDATE DIFF — ANIMATED FORENSIC COMPARISON */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-[#F4F7FB] dark:bg-[#050914] py-14 lg:py-16 px-6">
        <div className="max-w-[1320px] mx-auto space-y-7">
          <FadeRise>
            <div className="space-y-3">
              <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                MANDATE DIFF · FORENSIC COMPARISON
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <h2
                  className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100"
                  style={{ textWrap: 'balance' }}
                >
                  Destination outside mandate — Mandate Fidelity failed
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span>Requested Destination (••••9087)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-red-700 dark:text-red-400 font-semibold">
                    MANDATE FIDELITY — FAILED
                  </span>
                </div>
              </div>
            </div>
          </FadeRise>

          <MandateDiff
            mandate={flagshipMandate}
            transaction={flagshipTx}
            agent={flagshipAgent}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4" /> Authorized Account: ••••4412
              </span>
              <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold">
                <X className="w-4 h-4" /> Requested Account: ••••9087
              </span>
            </div>
            <span className="text-red-700 dark:text-red-300 font-semibold">
              DESTINATION OUTSIDE MANDATE
            </span>
          </div>
        </div>
      </section>

      {/* 6. DECISION ENGINE + 2D BEHAVIORAL DRIFT */}
      <section
        ref={decisionPathRef}
        className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070C1A] py-14 lg:py-16 px-6"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400 mb-1.5">
                DETERMINISTIC DECISION ENGINE
              </div>
              <h2
                className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100"
                style={{ textWrap: 'balance' }}
              >
                Authority → Fidelity → Behavior → Exposure → Expected Cost →
                Decision
              </h2>
            </div>

            <div className="space-y-2.5">
              {DECISION_LAYERS.map((layer, idx) => {
                const isActive = reduced ? true : idx <= activeLayerIdx;
                return (
                  <motion.div
                    key={layer.step}
                    animate={{
                      opacity: isActive ? 1 : 0.38,
                      x: isActive ? 0 : 8,
                    }}
                    transition={{ duration: 0.35, ease: SETTLE_EASE }}
                    className={`p-3.5 rounded-xl border bg-slate-50/70 dark:bg-[#0B1120] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isActive
                        ? layer.tone
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="font-mono text-xs font-semibold">
                          {layer.step}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {layer.detail}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-semibold shrink-0">
                      {layer.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            <BehavioralDriftViz driftActive />
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120] space-y-1.5">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                WHY DRIFT MATTERS
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Forty prior settlements aligned inside the mandate corridor at{' '}
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  ••••4412
                </span>{' '}
                (09:21 – 09:29). At{' '}
                <span className="font-mono text-red-700 dark:text-red-400">
                  09:32
                </span>
                , the external PDF altered beneficiary routing while keeping a
                routine amount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REAL CUSTOMER STEP-UP & BLOCK */}
      <CustomerStepUpSection
        stepUpOutcome={stepUpOutcome}
        onSelectOutcome={setStepUpOutcome}
      />

      {/* 8. WOW MOMENT — SIDE-BY-SIDE OUTCOME COMPARISON */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070C1A] py-14 lg:py-16 px-6">
        <div className="max-w-[1160px] mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
              SAME AGENT · SAME ₹1,40,000 INVOICE
            </div>
            <h2
              className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100"
              style={{ textWrap: 'balance' }}
            >
              Traditional Trust Check vs Mandate Guard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-[#0B1120] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                  TRADITIONAL TRUST CHECK
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-red-700 dark:text-red-400">
                  <ShieldX className="w-4 h-4" />→ ALLOW
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Agent</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Verified ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Trust</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    High ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Amount</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Within Limit ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Destination</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Looks Valid
                  </span>
                </div>
              </div>
              <div className="pt-2 text-sm font-semibold text-red-700 dark:text-red-400">
                Outcome: ₹1,40,000 transferred to ••••9087.
              </div>
            </div>

            <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-[#0B1120] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                  MANDATE GUARD
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  HOLD → STEP-UP → BLOCK
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Agent</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Verified ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Trust</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    High ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Amount</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Within Limit ✓
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Destination</span>
                  <span className="text-red-700 dark:text-red-400 font-semibold">
                    Outside Mandate ✕
                  </span>
                </div>
              </div>
              <div className="pt-2 text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                ₹1,40,000 LOSS PREVENTED
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REAL-LIFE ANALYST SCENE + ENTRY INTO REAL APPLICATION */}
      <AnalystConsoleSection />
    </PublicLayout>
  );
}
