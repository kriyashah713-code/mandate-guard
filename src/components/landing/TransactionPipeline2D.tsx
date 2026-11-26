import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Lock,
  PauseCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { SETTLE_EASE } from '../../animations/scrollSystem';
import type { DecisionState } from '../../types/domain';
import { formatInr } from '../../utils/format';

interface TransactionPipeline2DProps {
  decision: DecisionState;
  hasViolation: boolean;
  amountInr: number;
  agentName: string;
  registeredAccount: string;
  requestedAccount: string;
  payee: string;
  phaseLabel: string;
}

/**
 * Animated 2D fintech verification flow replacing 3D WebGL on the public landing page.
 * Shows the live transaction moving from Agent -> Mandate Verification Gate -> Destination,
 * pausing at the boundary on HOLD or locking the rogue path on BLOCK.
 */
export function TransactionPipeline2D({
  decision,
  hasViolation,
  amountInr,
  agentName,
  registeredAccount,
  requestedAccount,
  payee,
  phaseLabel,
}: TransactionPipeline2DProps) {
  const reduced = useReducedMotion();

  const isAllow = decision === 'ALLOW' && !hasViolation;
  const isHold = decision === 'HOLD' || decision === 'STEP-UP';
  const isBlock = decision === 'BLOCK';

  // Position along the 0..100 horizontal corridor
  const packetPercent = isAllow ? 88 : isHold ? 52 : 34;

  const badgeTone = isAllow
    ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
    : isBlock
      ? 'border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
      : 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';

  const StatusIcon = isAllow
    ? CheckCircle2
    : isBlock
      ? ShieldX
      : PauseCircle;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 sm:p-6 shadow-sm dark:shadow-none space-y-5">
      {/* Header Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
            PRE-SETTLEMENT VERIFICATION FLOW
          </div>
          <div className="text-sm font-semibold text-slate-950 dark:text-slate-100 mt-0.5">
            {phaseLabel}
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${badgeTone}`}
        >
          <StatusIcon className="w-4 h-4 shrink-0" />
          {decision}
        </div>
      </div>

      {/* Animated 2D Verification Corridor */}
      <div className="relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#070C1A] p-5 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center relative z-10">
          {/* Node 1: Agent */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-1">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              01. AGENT
            </div>
            <div className="text-xs font-semibold text-slate-950 dark:text-slate-100 truncate">
              {agentName}
            </div>
            <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              mTLS Verified ✓
            </div>
          </div>

          {/* Node 2: Mandate Boundary Gate */}
          <div
            className={`p-3.5 rounded-lg border space-y-1 transition-colors ${
              isAllow
                ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20'
                : isBlock
                  ? 'border-red-300 dark:border-red-500/50 bg-red-50/70 dark:bg-red-950/25'
                  : 'border-amber-300 dark:border-amber-500/50 bg-amber-50/70 dark:bg-amber-950/25'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                02. MANDATE GATE
              </span>
              {isAllow ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : isBlock ? (
                <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="text-xs font-semibold text-slate-950 dark:text-slate-100">
              MND-8841 Check
            </div>
            <div
              className={`text-[11px] font-mono font-semibold ${
                isAllow
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isBlock
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {isAllow
                ? 'Fidelity 100/100 · Pass'
                : isBlock
                  ? 'Boundary Closed · Blocked'
                  : 'Fidelity 14/100 · Held'}
            </div>
          </div>

          {/* Node 3: Destination Account */}
          <div
            className={`p-3.5 rounded-lg border space-y-1 transition-colors ${
              hasViolation
                ? 'border-red-300 dark:border-red-500/40 bg-red-50/50 dark:bg-red-950/15'
                : 'border-emerald-300 dark:border-emerald-500/40 bg-white dark:bg-[#0B1120]'
            }`}
          >
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              03. DESTINATION
            </div>
            <div className="text-xs font-semibold text-slate-950 dark:text-slate-100 truncate">
              {payee}
            </div>
            <div
              className={`text-[11px] font-mono font-semibold ${
                hasViolation
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {hasViolation
                ? `${requestedAccount} (Reg ${registeredAccount})`
                : `${registeredAccount} · Authorized`}
            </div>
          </div>
        </div>

        {/* Animated Horizontal Transaction Rail + Moving Packet */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
          <div className="relative h-9 flex items-center">
            {/* Base track */}
            <div className="absolute left-0 right-0 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />

            {/* Active progress fill */}
            <motion.div
              animate={{ width: `${packetPercent}%` }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.75, ease: SETTLE_EASE }
              }
              className={`absolute left-0 h-1 rounded-full ${
                isAllow
                  ? 'bg-emerald-500'
                  : isBlock
                    ? 'bg-red-500'
                    : 'bg-amber-500'
              }`}
            />

            {/* Gate Checkpoint Line at 55% */}
            <div
              style={{ left: '55%' }}
              className={`absolute top-0 bottom-0 w-0.5 -translate-x-1/2 ${
                isAllow
                  ? 'bg-emerald-500/50'
                  : isBlock
                    ? 'bg-red-600'
                    : 'bg-amber-500'
              }`}
            />

            {/* Moving Transaction Packet Pill */}
            <motion.div
              animate={{ left: `${packetPercent}%` }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.85, ease: SETTLE_EASE }
              }
              className={`absolute -translate-x-1/2 px-3 py-1 rounded-md border text-[11px] font-mono font-semibold shadow-xs whitespace-nowrap ${
                isAllow
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : isBlock
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-amber-500 border-amber-400 text-slate-950'
              }`}
            >
              {formatInr(amountInr)} → {requestedAccount}
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Initiated by Agent</span>
            <span>Mandate Gate ({registeredAccount})</span>
            <span>
              {isBlock
                ? 'Settlement Blocked'
                : isHold
                  ? 'Frozen Pre-Settlement'
                  : 'Settled to Payee'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
