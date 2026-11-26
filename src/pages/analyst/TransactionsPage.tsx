import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator, RiskText } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import type { DecisionState } from '../../types/domain';
import { formatInr } from '../../utils/format';

export function TransactionsPage() {
  const { transactions, agents, principals } = useAppState();
  const [filter, setFilter] = useState<'ALL' | DecisionState>('ALL');
  const [query, setQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filter !== 'ALL' && tx.decision.decision !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.payee.toLowerCase().includes(q) ||
        tx.destinationAccount.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <WorkspaceLayout role="ANALYST" breadcrumb="Risk Operations / Transactions">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              Transaction Decisions &amp; Escalations
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Action-by-action evaluation across Authority, Mandate Fidelity,
              Behavior Drift, and Expected Cost.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ID, payee, account..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
              {(['ALL', 'HOLD', 'STEP-UP', 'BLOCK', 'ALLOW'] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilter(st)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      filter === st
                        ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Transaction</th>
                  <th className="py-3.5 px-4 font-medium">Agent &amp; Principal</th>
                  <th className="py-3.5 px-4 font-medium">Payee &amp; Account</th>
                  <th className="py-3.5 px-4 font-medium text-right">Trust</th>
                  <th className="py-3.5 px-4 font-medium text-right">Fidelity</th>
                  <th className="py-3.5 px-4 font-medium text-right">Amount</th>
                  <th className="py-3.5 px-4 font-medium">Risk</th>
                  <th className="py-3.5 px-4 font-medium">Decision</th>
                  <th className="py-3.5 px-6 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {filtered.map((tx) => {
                  const ag = agents.find((a) => a.id === tx.agentId);
                  const pr = principals.find((p) => p.id === tx.principalId);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-3.5 px-6">
                        <div className="font-mono text-xs text-slate-950 dark:text-slate-100">
                          {tx.id}
                        </div>
                        <div className="text-xs text-slate-500">
                          {tx.timestamp}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {ag?.name || tx.agentId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {pr?.name || tx.principalId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200">
                          {tx.payee}
                        </div>
                        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {tx.destinationAccount}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {tx.decision.agentTrust}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-mono text-right tabular-nums ${
                          tx.decision.mandateFidelity < 50
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {tx.decision.mandateFidelity}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                        {formatInr(tx.amountInr)}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskText risk={tx.decision.transactionRisk} />
                      </td>
                      <td className="py-3.5 px-4">
                        <DecisionIndicator decision={tx.decision.decision} size="sm" />
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/transactions/${tx.id}`}
                          className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 whitespace-nowrap"
                        >
                          Decision View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
