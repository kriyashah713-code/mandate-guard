import { Link } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import { formatCompactInr, formatInr } from '../../utils/format';

export function CasesPage() {
  const { cases, agents, principals, totalLossPreventedInr } = useAppState();

  return (
    <WorkspaceLayout role="ANALYST" breadcrumb="Risk Operations / Fraud Cases">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              Fraud Cases &amp; Prevented Losses
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Forensic records of blocked mandate violations and customer
              step-up rejections.
            </p>
          </div>
          <div className="px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="text-xs text-emerald-800 dark:text-emerald-300">
              Cumulative Loss Prevented
            </div>
            <div className="text-xl font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCompactInr(totalLossPreventedInr)}
            </div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Case ID</th>
                  <th className="py-3.5 px-4 font-medium">Transaction</th>
                  <th className="py-3.5 px-4 font-medium">Agent &amp; Principal</th>
                  <th className="py-3.5 px-4 font-medium">Primary Reason</th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Loss Prevented
                  </th>
                  <th className="py-3.5 px-4 font-medium">Decision</th>
                  <th className="py-3.5 px-6 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {cases.map((fc) => {
                  const ag = agents.find((a) => a.id === fc.agentId);
                  const pr = principals.find((p) => p.id === fc.principalId);
                  return (
                    <tr
                      key={fc.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          {fc.id}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fc.openedAt}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                        {fc.transactionId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-900 dark:text-slate-200">
                          {ag?.name || fc.agentId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {pr?.name || fc.principalId}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {fc.reasonCodes[0]?.title}
                      </td>
                      <td className="py-4 px-4 font-mono text-right text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                        {formatInr(fc.lossPreventedInr)}
                      </td>
                      <td className="py-4 px-4">
                        <DecisionIndicator decision={fc.decision} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/cases/${fc.id}`}
                          className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 whitespace-nowrap"
                        >
                          Open Case →
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
