import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  ShieldX,
  ArrowRight,
} from 'lucide-react';
import { PublicLayout } from '../../components/PublicLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { MandateDiff } from '../../components/MandateDiff';
import { MandateSpace } from '../../three/MandateSpace';
import { useAppState } from '../../context/AppStateContext';
import { formatCompactInr } from '../../utils/format';

export function DemoPage() {
  const {
    transactions,
    mandates,
    agents,
    respondToStepUp,
    resetFlagshipDemo,
    cases,
  } = useAppState();

  const [step, setStep] = useState<'BASELINE_40' | 'TX_41_HOLD' | 'DECISION'>(
    'TX_41_HOLD',
  );

  const tx41 =
    transactions.find((t) => t.id === 'TX-2026-0041') || transactions[0];
  const tx39 =
    transactions.find((t) => t.id === 'TX-2026-0039') || transactions[2];
  const mandate = mandates[0];
  const agent = agents[0];
  const linkedCase = cases.find((c) => c.transactionId === tx41.id);

  const isBlocked = tx41.decision.decision === 'BLOCK';

  const handleCustomerReject = () => {
    respondToStepUp(tx41.id, 'REJECT');
    setStep('DECISION');
  };

  const handleReset = () => {
    resetFlagshipDemo();
    setStep('TX_41_HOLD');
  };

  const activeTx = step === 'BASELINE_40' ? tx39 : tx41;

  return (
    <PublicLayout>
      <section className="max-w-[1320px] mx-auto px-6 py-12 space-y-8">
        {/* Header & Story Stepper */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
              Flagship Judge Walkthrough · ₹1,40,000 Account Substitution
            </div>
            <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-slate-100">
              40 Normal Transactions Pass. Transaction #41 Is Intercepted.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Follow how a trusted ERP agent (Trust 92/100) within its
              ₹2,00,000 limit is stopped when a prompt-injected invoice changes
              ABC Industries&apos; registered account (••••4412) to ••••9087.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('BASELINE_40')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                step === 'BASELINE_40'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 font-semibold'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              1. 40 Normal Txs (ALLOW)
            </button>
            <button
              type="button"
              onClick={() => setStep('TX_41_HOLD')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                step === 'TX_41_HOLD'
                  ? 'bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950 border-amber-500 dark:border-amber-300 font-semibold'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              2. Tx #41 Intercepted (HOLD)
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800 bg-white dark:bg-transparent rounded-lg hover:text-slate-950 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* 3D Mandate Space reacting live */}
        <MandateSpace
          decision={activeTx.decision.decision}
          hasViolation={!activeTx.decision.authorityPass}
          amountInr={activeTx.amountInr}
          agentName={agent.name}
          principalName="Arvind Mehta"
          registeredAccount="••••4412"
          requestedAccount={activeTx.destinationAccount}
          payee={activeTx.payee}
          heightClass="h-[400px]"
        />

        {step === 'BASELINE_40' ? (
          <div className="border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-[#0B1120] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs dark:shadow-none">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Transactions #1 – #40 Verified
              </div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                FinOps Supplier Autopay v2 operates normally inside Mandate
                MND-8841
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                40 consecutive supplier settlements to ABC Industries registered
                account ••••4412 passed Authority, Fidelity (98/100), and
                Behavior checks. Trust score stands at 92/100.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('TX_41_HOLD')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 whitespace-nowrap shrink-0"
            >
              Trigger Transaction #41
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Step-Up Prompt & Live Result */}
            <div
              className={`border rounded-xl p-6 shadow-xs dark:shadow-none ${
                isBlocked
                  ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/15'
                  : 'border-amber-300 dark:border-amber-500/40 bg-white dark:bg-[#0B1120]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <DecisionIndicator
                      decision={tx41.decision.decision}
                      size="lg"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {tx41.id} · Agent Trust {tx41.decision.agentTrust}/100 ·
                      Mandate Fidelity {tx41.decision.mandateFidelity}/100
                    </span>
                  </div>

                  {!isBlocked ? (
                    <>
                      <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                        Customer STEP-UP Verification Sent to Arvind Mehta
                      </h2>
                      <p className="text-sm text-slate-800 dark:text-slate-200 p-3.5 rounded-lg bg-slate-50 dark:bg-[#070C1A] border border-slate-200 dark:border-slate-800">
                        &ldquo;{tx41.customerPlainExplanation}&rdquo;
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                        STEP-UP → Customer Rejected (&ldquo;NOT ME&rdquo;) →
                        BLOCK → {formatCompactInr(tx41.amountInr)} Loss
                        Prevented
                      </h2>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Fraud Case{' '}
                        <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                          {linkedCase?.id || 'CASE-2026'}
                        </span>{' '}
                        has been automatically opened with full Mandate Diff and
                        prompt-injection evidence.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {!isBlocked ? (
                    <button
                      type="button"
                      onClick={handleCustomerReject}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap"
                    >
                      <ShieldX className="w-4 h-4" />
                      Customer Selects: NOT ME
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Inspect in Risk Analyst Workspace
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <MandateDiff
              mandate={mandate}
              transaction={tx41}
              agent={agent}
            />
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
