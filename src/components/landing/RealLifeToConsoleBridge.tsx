import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldX,
  UserCheck,
} from 'lucide-react';
import customerPhonePhoto from '../../assets/images/customer_phone_approval_1795610977119.jpg';
import analystOpsPhoto from '../../assets/images/risk_analyst_ops_1795610959255.jpg';
import { CinematicPhotoFrame } from './CinematicPhotoFrame';
import { TransactionPipeline2D } from './TransactionPipeline2D';
import { useAppState } from '../../context/AppStateContext';
import { SETTLE_EASE } from '../../animations/scrollSystem';
import { formatInr } from '../../utils/format';

export function CustomerStepUpSection({
  stepUpOutcome,
  onSelectOutcome,
}: {
  stepUpOutcome: 'pending' | 'approved' | 'rejected';
  onSelectOutcome: (next: 'pending' | 'approved' | 'rejected') => void;
}) {
  const reduced = useReducedMotion();

  const blockSteps = [
    { label: 'Customer', value: 'NOT ME' },
    { label: 'Security Engine', value: 'REJECTED' },
    { label: 'Transaction', value: 'BLOCKED' },
    { label: 'Outcome', value: '₹1,40,000 EXPOSURE PREVENTED' },
  ];

  return (
    <section className="border-t border-slate-200 dark:border-slate-800/80 bg-[#F4F7FB] dark:bg-[#050914] py-14 lg:py-16 px-6">
      <div className="max-w-[1320px] mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono text-amber-700 dark:text-amber-300">
              STEP-UP → CUSTOMER VERIFICATION
            </div>
            <h2 className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100">
              Confirmation happens on the customer&apos;s device before release.
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Out-of-Band Principal Verification · TX-2026-0041
          </span>
        </div>

        {/* Full-Bleed Editorial Customer Photography + Layered Step-Up UI */}
        <CinematicPhotoFrame
          src={customerPhonePhoto}
          alt="Corporate finance manager reviewing a step-up payment alert on smartphone"
          zoomRange={[1, 1.12]}
          focalOrigin="42% 58%"
          heightClass="h-[560px] sm:h-[500px]"
          scrimClassName="bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/74 to-transparent dark:from-[#050914]/95 dark:via-[#050914]/72 dark:to-transparent"
        >
          <div className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-md p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 shadow-lg dark:shadow-none space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-300">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  TRANSACTION REQUIRES APPROVAL
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  TX-2026-0041
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums">
                    ₹1,40,000
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    ABC Industries
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono py-2 px-3 rounded-lg bg-slate-50 dark:bg-[#070C1A] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    Destination Account
                  </span>
                  <span className="text-red-700 dark:text-red-400 font-semibold">
                    ••••9087 (Outside Mandate)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  &ldquo;This account is not included in your supplier-payment
                  mandate.&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectOutcome('approved')}
                  className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    stepUpOutcome === 'approved'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  APPROVE
                </button>
                <button
                  type="button"
                  onClick={() => onSelectOutcome('rejected')}
                  className={`px-5 py-2 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    stepUpOutcome === 'rejected'
                      ? 'bg-red-700 text-white'
                      : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                >
                  NOT ME
                </button>
                {stepUpOutcome !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => onSelectOutcome('pending')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {stepUpOutcome === 'rejected' && (
                <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-red-700 dark:text-red-400">
                    <ShieldX className="w-4 h-4 shrink-0" />
                    BLOCKED · DESTINATION SEALED
                  </div>
                  <div className="text-base font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    ₹1,40,000 EXPOSURE PREVENTED
                  </div>
                </div>
              )}

              {stepUpOutcome === 'approved' && (
                <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    PRINCIPAL EXCEPTION LOGGED
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Click &ldquo;NOT ME&rdquo; to verify fraud containment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CinematicPhotoFrame>

        {/* Customer Response -> Animated 2D Containment Flow */}
        {stepUpOutcome === 'rejected' && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: SETTLE_EASE }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0B1120] p-5 space-y-4 shadow-xs dark:shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-red-700 dark:text-red-400">
                  <Lock className="w-4 h-4" />
                  RESPONSE PROPAGATION · BOUNDARY CLOSED &amp; DESTINATION LOCKED
                </div>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  ₹1,40,000 EXPOSURE PREVENTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {blockSteps.map((step, i) => (
                  <div
                    key={step.label}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070C1A] flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <span className="text-slate-500 dark:text-slate-400">
                      0{i + 1} · {step.label}
                    </span>
                    <span
                      className={
                        i === 3
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-red-700 dark:text-red-400 font-semibold'
                      }
                    >
                      {step.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <TransactionPipeline2D
              decision="BLOCK"
              hasViolation
              amountInr={140000}
              agentName="Supplier Payment Agent"
              registeredAccount="••••4412"
              requestedAccount="••••9087"
              payee="ABC Industries"
              phaseLabel="Customer Rejected → Settlement Blocked"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function AnalystConsoleSection() {
  const { transactions, agents, sessions, cases } = useAppState();
  const flagshipTx =
    transactions.find((t) => t.id === 'TX-2026-0041') || transactions[0];
  const flagshipAgent = agents[0];
  const flagshipSession = sessions[0];
  const flagshipCase = cases[0];

  return (
    <section className="border-t border-slate-200 dark:border-slate-800/80 bg-[#F4F7FB] dark:bg-[#050914] py-14 lg:py-16 px-6">
      <div className="max-w-[1320px] mx-auto space-y-14">
        {/* Editorial Risk Analyst Photograph + Layered Operations Console Snapshot */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                MANDATE GUARD OPERATIONS CONSOLE
              </div>
              <h2 className="text-3xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100">
                What the bank&apos;s fraud analyst sees in real time.
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Priya Nair · Transaction Risk Operations
            </span>
          </div>

          <CinematicPhotoFrame
            src={analystOpsPhoto}
            alt="Bank risk operations analyst monitoring live agent mandate decisions on dual screens"
            zoomRange={[1, 1.08]}
            focalOrigin="64% 45%"
            heightClass="h-[510px] sm:h-[470px]"
            scrimClassName="bg-gradient-to-r from-[#F4F7FB]/96 via-[#F4F7FB]/74 to-transparent dark:from-[#050914]/95 dark:via-[#050914]/72 dark:to-transparent"
          >
            <div className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-10">
              <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 p-5 sm:p-6 space-y-4 shadow-lg dark:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                    LIVE CONSOLE · {flagshipSession?.id || 'SES-9041'}
                  </span>
                  <span className="text-red-700 dark:text-red-400 font-semibold">
                    {flagshipTx.decision.decision} · FIDELITY{' '}
                    {flagshipTx.decision.mandateFidelity}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Agent Class</div>
                    <div className="font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                      {flagshipAgent.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Trust Score</div>
                    <div className="font-mono text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                      {flagshipAgent.trustScore}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Transaction</div>
                    <div className="font-mono text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                      {formatInr(flagshipTx.amountInr)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Fraud Case</div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {flagshipCase?.id || 'CASE-2026-104'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                  <strong className="text-slate-950 dark:text-white">
                    Reason Code 01:
                  </strong>{' '}
                  {flagshipTx.decision.reasonCodes[0]?.title} —{' '}
                  {flagshipTx.decision.reasonCodes[0]?.detail}
                </div>
              </div>
            </div>
          </CinematicPhotoFrame>
        </div>

        {/* Final Closing Statement + Transition into Role-Based Workspaces */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 text-center max-w-4xl mx-auto space-y-5">
          <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
            NOW INVESTIGATE THE DECISION
          </div>

          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-100 leading-tight"
            style={{ textWrap: 'balance' }}
          >
            The most dangerous agent isn&apos;t the one the bank doesn&apos;t
            recognize.{' '}
            <span className="text-cyan-700 dark:text-cyan-300">
              It&apos;s the one the bank trusts — doing something its owner
              never asked for.
            </span>
          </h2>

          <div className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">
            Enter Mandate Guard
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <Link
              to="/login"
              state={{ presetRole: 'ANALYST' }}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4" />
              Enter Operations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              state={{ presetRole: 'CUSTOMER' }}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              Customer View
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
