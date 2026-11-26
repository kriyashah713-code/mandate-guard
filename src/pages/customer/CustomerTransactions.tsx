import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import type { DecisionState } from '../../types/domain';
import { formatInr } from '../../utils/format';

export function CustomerTransactions() {
  const { user, transactions, agents } = useAppState();
  const [filter, setFilter] = useState<'ALL' | DecisionState>('ALL');

  const principalId = user?.principalId || 'prin-mehta-01';
  const myTransactions = transactions
    .filter((t) => t.principalId === principalId)
    .filter((t) => (filter === 'ALL' ? true : t.decision.decision === filter));

  return (
    <WorkspaceLayout
      role="CUSTOMER"
      breadcrumb="Principal Workspace / Transactions"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              Transaction History
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Every action evaluated against your delegated mandates.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
            {(['ALL', 'ALLOW', 'HOLD', 'STEP-UP', 'BLOCK'] as const).map(
              (state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setFilter(state)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filter === state
                      ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                  }`}
                >
                  {state}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl divide-y divide-slate-200 dark:divide-slate-800/80 shadow-xs dark:shadow-none">
          {myTransactions.map((tx) => {
            const agent = agents.find((a) => a.id === tx.agentId);
            return (
              <div
                key={tx.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {tx.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{tx.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>{agent?.name || tx.agentId}</span>
                  </div>
                  <div className="text-base font-medium text-slate-950 dark:text-slate-100">
                    {tx.payee} ·{' '}
                    <span className="font-mono">{tx.destinationAccount}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {tx.customerPlainExplanation}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums">
                      {formatInr(tx.amountInr)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Mandate {tx.mandateId}
                    </div>
                  </div>
                  <DecisionIndicator decision={tx.decision.decision} />
                  {tx.customerApprovalStatus === 'PENDING' && (
                    <Link
                      to="/customer/approvals"
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 whitespace-nowrap"
                    >
                      Respond
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
