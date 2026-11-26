import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator, RiskText } from '../../components/DecisionBadge';
import { MandateSpace } from '../../three/MandateSpace';
import { useAppState } from '../../context/AppStateContext';
import { formatCompactInr, formatInr } from '../../utils/format';

export function OperationsPage() {
  const {
    transactions,
    sessions,
    agents,
    principals,
    cases,
    activeSceneTxId,
    setActiveSceneTxId,
    totalLossPreventedInr,
  } = useAppState();

  const attentionQueue = transactions.filter(
    (t) =>
      t.decision.decision === 'HOLD' ||
      t.decision.decision === 'STEP-UP' ||
      t.analystReviewStatus === 'ESCALATED',
  );

  const activeTx =
    transactions.find((t) => t.id === activeSceneTxId) ||
    attentionQueue[0] ||
    transactions[0];
  const activeAgent = agents.find((a) => a.id === activeTx.agentId);
  const activePrincipal = principals.find((p) => p.id === activeTx.principalId);

  const blockedTxs = transactions.filter((t) => t.decision.decision === 'BLOCK');

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb="Risk Operations / Live Command Overview"
      action={
        <Link
          to="/simulations"
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          Open Simulation Lab
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Top Priority Banner: What Requires Analyst Attention Now */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h1 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                Requires Analyst Attention Now ({attentionQueue.length})
              </h1>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span>Active Sessions: {sessions.length}</span>
              <span>Open/Resolved Cases: {cases.length}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Loss Prevented: {formatCompactInr(totalLossPreventedInr)}
              </span>
            </div>
          </div>

          {attentionQueue.length === 0 ? (
            <div className="p-6 text-sm text-slate-600 dark:text-slate-400">
              No transactions currently awaiting analyst review. Run a scenario
              in Simulation Lab or inspect recent blocked decisions below.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {attentionQueue.map((tx) => {
                const ag = agents.find((a) => a.id === tx.agentId);
                return (
                  <div
                    key={tx.id}
                    className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                          {tx.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ag?.name || tx.agentId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Trust {tx.decision.agentTrust}/100</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-700 dark:text-red-400 font-mono">
                          Fidelity {tx.decision.mandateFidelity}/100
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-950 dark:text-slate-100">
                        {formatInr(tx.amountInr)} to {tx.payee} (
                        <span className="font-mono">{tx.destinationAccount}</span>
                        ) — {tx.decision.authorityNote}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <DecisionIndicator decision={tx.decision.decision} />
                      <button
                        type="button"
                        onClick={() => setActiveSceneTxId(tx.id)}
                        className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors whitespace-nowrap"
                      >
                        Focus 3D
                      </button>
                      <Link
                        to={`/transactions/${tx.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap"
                      >
                        Investigate
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Live 3D Mandate Space Synced to Active Decision */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                Mandate Space — Live Spatial Decision State
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inspecting {activeTx.id} · {activeAgent?.name} ·{' '}
                {activeTx.decision.decision}
              </p>
            </div>
            <Link
              to={`/transactions/${activeTx.id}`}
              className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
            >
              Open Full Transaction Decision Screen →
            </Link>
          </div>
          <MandateSpace
            decision={activeTx.decision.decision}
            hasViolation={!activeTx.decision.authorityPass}
            amountInr={activeTx.amountInr}
            agentName={activeAgent?.name || activeTx.agentId}
            principalName={activePrincipal?.name || 'Principal'}
            registeredAccount={`••••${activeTx.registeredExpectedLast4}`}
            requestedAccount={activeTx.destinationAccount}
            payee={activeTx.payee}
            heightClass="h-[400px]"
          />
        </section>

        {/* Split Operational Columns: Active Sessions + Recent Decisions & Fraud Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                Active Agent Sessions
              </h2>
              <Link
                to="/sessions"
                className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
              >
                Inspect Sessions
              </Link>
            </div>
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/70">
              {sessions.slice(0, 4).map((ses) => {
                const ag = agents.find((a) => a.id === ses.agentId);
                return (
                  <Link
                    key={ses.id}
                    to={`/sessions?id=${ses.id}`}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {ses.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ses.durationLabel}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-950 dark:text-slate-100 truncate mt-0.5">
                        {ag?.name || ses.agentId}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <RiskText risk={ses.currentRisk} />
                      <DecisionIndicator decision={ses.decisionState} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                Recent Blocked Actions &amp; Fraud Cases
              </h2>
              <Link
                to="/cases"
                className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
              >
                All Fraud Cases
              </Link>
            </div>
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/70">
              {cases.slice(0, 3).map((fc) => (
                <Link
                  key={fc.id}
                  to={`/cases/${fc.id}`}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-emerald-700 dark:text-emerald-400">
                        {fc.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{fc.transactionId}</span>
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {fc.reasonCodes[0]?.title}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatCompactInr(fc.lossPreventedInr)}
                    </div>
                    <div className="text-xs text-slate-500">Prevented</div>
                  </div>
                </Link>
              ))}
              {blockedTxs.slice(0, 2).map((tx) => (
                <Link
                  key={`blk-${tx.id}`}
                  to={`/transactions/${tx.id}`}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-red-700 dark:text-red-400">
                      {tx.id} · Blocked Settlement
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {tx.payee} ({tx.destinationAccount})
                    </div>
                  </div>
                  <div className="font-mono text-sm text-slate-900 dark:text-slate-200 tabular-nums shrink-0">
                    {formatInr(tx.amountInr)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
