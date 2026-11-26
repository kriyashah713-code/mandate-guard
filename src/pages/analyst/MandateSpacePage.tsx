import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { MandateDiff } from '../../components/MandateDiff';
import { MandateSpace } from '../../three/MandateSpace';
import { useAppState } from '../../context/AppStateContext';
import type { DecisionState } from '../../types/domain';
import { formatInr } from '../../utils/format';

export function MandateSpacePage() {
  const {
    transactions,
    agents,
    principals,
    mandates,
    activeSceneTxId,
    setActiveSceneTxId,
  } = useAppState();

  const selectedTx =
    transactions.find((t) => t.id === activeSceneTxId) || transactions[0];
  const [overrideState, setOverrideState] = useState<DecisionState | null>(null);

  const agent = agents.find((a) => a.id === selectedTx.agentId);
  const principal = principals.find((p) => p.id === selectedTx.principalId);
  const mandate = mandates.find((m) => m.id === selectedTx.mandateId);

  const activeDecision = overrideState || selectedTx.decision.decision;
  const hasViolation =
    overrideState === 'ALLOW'
      ? false
      : overrideState === 'BLOCK' || overrideState === 'HOLD'
        ? true
        : !selectedTx.decision.authorityPass;

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb="Risk Operations / 3D Mandate Space"
      action={
        <Link
          to={`/transactions/${selectedTx.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Investigate {selectedTx.id}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              Mandate Space — Spatial Authority Environment
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Principal → Delegated Mandate Boundary → Agent → Action →
              Decision. Select any transaction or test a spatial state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTx.id}
              onChange={(e) => {
                setActiveSceneTxId(e.target.value);
                setOverrideState(null);
              }}
              className="px-3 py-2 text-xs font-mono bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
            >
              {transactions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.payee} ({t.decision.decision})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
              {(['ALLOW', 'STEP-UP', 'HOLD', 'BLOCK'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOverrideState(st)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                    activeDecision === st
                      ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full Spatial Viewport */}
        <MandateSpace
          decision={activeDecision}
          hasViolation={hasViolation}
          amountInr={selectedTx.amountInr}
          agentName={agent?.name || selectedTx.agentId}
          principalName={principal?.name || 'Principal'}
          registeredAccount={`••••${selectedTx.registeredExpectedLast4}`}
          requestedAccount={selectedTx.destinationAccount}
          payee={selectedTx.payee}
          heightClass="h-[520px]"
        />

        {/* Context Summary Bar + Mandate Diff */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs dark:shadow-none">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500">Transaction: </span>
              <span className="font-mono text-slate-950 dark:text-slate-100">
                {selectedTx.id}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Amount: </span>
              <span className="font-mono text-slate-950 dark:text-slate-100 tabular-nums">
                {formatInr(selectedTx.amountInr)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Trust: </span>
              <span className="font-mono text-slate-950 dark:text-slate-100">
                {selectedTx.decision.agentTrust}/100
              </span>
            </div>
            <div>
              <span className="text-slate-500">Fidelity: </span>
              <span
                className={`font-mono ${
                  selectedTx.decision.mandateFidelity < 50
                    ? 'text-red-700 dark:text-red-400 font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {selectedTx.decision.mandateFidelity}/100
              </span>
            </div>
          </div>
          <DecisionIndicator decision={activeDecision} />
        </div>

        {mandate && (
          <MandateDiff
            mandate={mandate}
            transaction={selectedTx}
            agent={agent}
          />
        )}
      </div>
    </WorkspaceLayout>
  );
}
