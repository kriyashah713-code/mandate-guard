import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import { formatCompactInr, formatInr } from '../../utils/format';

export function CustomerOverview() {
  const { user, principals, mandates, agents, transactions } = useAppState();
  const principalId = user?.principalId || 'prin-mehta-01';
  const principal = principals.find((p) => p.id === principalId) || principals[0];
  const myMandates = mandates.filter((m) => m.principalId === principalId);
  const myAgents = agents.filter((a) => a.principalId === principalId);
  const myTransactions = transactions.filter((t) => t.principalId === principalId);
  const pendingStepUps = myTransactions.filter(
    (t) =>
      t.customerApprovalStatus === 'PENDING' &&
      (t.decision.decision === 'HOLD' || t.decision.decision === 'STEP-UP'),
  );

  return (
    <WorkspaceLayout
      role="CUSTOMER"
      breadcrumb="Principal Workspace / Overview"
      action={
        <Link
          to="/customer/mandates"
          className="px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          New Mandate
        </Link>
      }
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {principal.businessName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {principal.name} · {principal.accountNumber} · {principal.city}
          </p>
        </div>

        {/* Immediate Attention Banner for Pending STEP-UP */}
        {pendingStepUps.length > 0 && (
          <section className="border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 shadow-xs dark:shadow-none">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    {pendingStepUps.length} Agent Action Requiring Your Confirmation
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                  {formatInr(pendingStepUps[0].amountInr)} to{' '}
                  {pendingStepUps[0].payee} ({pendingStepUps[0].destinationAccount})
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {pendingStepUps[0].customerPlainExplanation}
                </p>
              </div>
              <Link
                to="/customer/approvals"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950 rounded-lg hover:bg-amber-600 dark:hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
              >
                Review &amp; Decide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Operational Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 shadow-xs dark:shadow-none">
          <div className="p-6">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Active Mandates
            </div>
            <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-2">
              {myMandates.filter((m) => m.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Max delegated ceiling{' '}
              {formatCompactInr(
                Math.max(0, ...myMandates.map((m) => m.maxAmountInr)),
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Authorized Agents
            </div>
            <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-2">
              {myAgents.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {myAgents.filter((a) => a.status === 'ACTIVE').length} active ·{' '}
              {myAgents.filter((a) => a.status !== 'ACTIVE').length} restricted
            </div>
          </div>
          <div className="p-6">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Pending Approvals
            </div>
            <div className="text-2xl font-mono font-semibold text-amber-700 dark:text-amber-300 tabular-nums mt-2">
              {pendingStepUps.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Requires out-of-band confirmation
            </div>
          </div>
        </div>

        {/* Recent Agent Actions */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Recent Delegated Activity
            </h2>
            <Link
              to="/customer/transactions"
              className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
            >
              View All Transactions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3 px-6 font-medium">Transaction</th>
                  <th className="py-3 px-4 font-medium">Payee</th>
                  <th className="py-3 px-4 font-medium">Account</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-6 font-medium text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {myTransactions.slice(0, 6).map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-mono text-xs text-slate-900 dark:text-slate-200">
                        {tx.id}
                      </div>
                      <div className="text-xs text-slate-500">{tx.timestamp}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      {tx.payee}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {tx.destinationAccount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                      {formatInr(tx.amountInr)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <DecisionIndicator decision={tx.decision.decision} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
