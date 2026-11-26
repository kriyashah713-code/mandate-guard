import { Link, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function MandateDetailPage() {
  const { id } = useParams();
  const { mandates, principals, agents, transactions } = useAppState();

  const mandate = mandates.find((m) => m.id === id) || mandates[0];
  const principal = principals.find((p) => p.id === mandate.principalId);
  const agent = agents.find((a) => a.id === mandate.agentId);
  const mandateTxs = transactions.filter((t) => t.mandateId === mandate.id);
  const violations = mandateTxs.filter((t) => !t.decision.authorityPass);

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb={`Risk Operations / Mandates / ${mandate.id}`}
      action={
        <Link
          to="/mandates"
          className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg"
        >
          Back to Mandates
        </Link>
      }
    >
      <div className="space-y-8">
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {mandate.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>{mandate.status}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Valid {mandate.validFrom} to {mandate.validUntil}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                {mandate.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {mandate.purpose}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Per-Invoice Ceiling
              </div>
              <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-0.5">
                {formatInr(mandate.maxAmountInr)}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Principal</dt>
              <dd className="text-slate-950 dark:text-slate-100 mt-1">
                {principal?.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Bound Agent</dt>
              <dd className="mt-1">
                <Link
                  to={`/agents/${agent?.id}`}
                  className="text-cyan-700 dark:text-cyan-400 hover:underline"
                >
                  {agent?.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Daily Limit &amp; Cadence</dt>
              <dd className="font-mono text-slate-900 dark:text-slate-200 mt-1">
                {formatInr(mandate.dailyLimitInr)} · {mandate.frequencyLimit}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Sub-Agent Delegation</dt>
              <dd className="font-mono text-slate-900 dark:text-slate-200 mt-1">
                {mandate.subAgentDelegationAllowed ? 'Permitted' : 'Prohibited'}
              </dd>
            </div>
          </dl>
        </section>

        {/* Visual Representation of the Boundary of Authority */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-1">
            Boundary of Authority Envelope
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
            Inside the boundary: strictly authorized execution parameters. Outside:
            hard authority violations that cannot be overridden by agent trust.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/10">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
                INSIDE BOUNDARY (AUTHORIZED)
              </div>
              <ul className="space-y-3 text-sm text-slate-800 dark:text-slate-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Registered Destination Accounts:{' '}
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                      {mandate.allowedAccounts.map((a) => `••••${a}`).join(', ')}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Allowed Suppliers: {mandate.allowedPayees.join(', ')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Max Per-Action Amount:{' '}
                    <span className="font-mono">
                      {formatInr(mandate.maxAmountInr)}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Allowed Channels: {mandate.allowedChannels.join(', ')}
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/60 dark:bg-red-950/10">
              <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-4">
                OUTSIDE BOUNDARY (VIOLATIONS &amp; DRIFT DETECTED)
              </div>
              {violations.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No boundary violations detected under this mandate yet.
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {violations.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-red-200 dark:border-red-900/30 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-slate-950 dark:text-slate-100 font-medium">
                            {v.id} · {formatInr(v.amountInr)} →{' '}
                            <span className="font-mono text-red-700 dark:text-red-300">
                              {v.destinationAccount}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {v.decision.authorityNote}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/transactions/${v.id}`}
                        className="text-xs text-cyan-700 dark:text-cyan-400 hover:underline shrink-0"
                      >
                        Inspect
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Recent Actions Under Mandate */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Recent Actions Under Mandate
            </h2>
          </div>
          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/70">
            {mandateTxs.map((tx) => (
              <Link
                key={tx.id}
                to={`/transactions/${tx.id}`}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {tx.id} · {tx.timestamp}
                  </div>
                  <div className="text-sm text-slate-950 dark:text-slate-100 mt-0.5">
                    {tx.payee} ({tx.destinationAccount})
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-sm text-slate-900 dark:text-slate-200 tabular-nums">
                    {formatInr(tx.amountInr)}
                  </span>
                  <DecisionIndicator decision={tx.decision.decision} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
