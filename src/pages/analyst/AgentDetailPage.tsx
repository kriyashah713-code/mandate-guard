import { Link, useParams } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function AgentDetailPage() {
  const { id } = useParams();
  const { agents, mandates, sessions, transactions, principals } =
    useAppState();

  const agent = agents.find((a) => a.id === id) || agents[0];
  const principal = principals.find((p) => p.id === agent.principalId);
  const agentMandates = mandates.filter((m) => m.agentId === agent.id);
  const agentSessions = sessions.filter((s) => s.agentId === agent.id);
  const agentTxs = transactions.filter((t) => t.agentId === agent.id);

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb={`Risk Operations / Agents / ${agent.id}`}
      action={
        <Link
          to="/agents"
          className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg"
        >
          Back to Agents
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Identity & Provenance Header */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {agent.type}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{agent.id}</span>
                <span aria-hidden="true">·</span>
                <span>{agent.status}</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                {agent.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Delegated by {principal?.name} ({principal?.businessName})
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Agent Trust Score
                </div>
                <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-0.5">
                  {agent.trustScore}/100
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Historical Actions
                </div>
                <div className="text-2xl font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                  {agent.verifiedActionsCount}/{agent.historicalActionsCount}
                </div>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Provenance Issuer</dt>
              <dd className="text-slate-900 dark:text-slate-200 mt-1">
                {agent.provenance.issuer}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">SDK / Attestation</dt>
              <dd className="font-mono text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                {agent.provenance.sdkVersion}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Certificate Fingerprint</dt>
              <dd className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 truncate">
                {agent.provenance.certificateFingerprint}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Deployment Environment</dt>
              <dd className="text-slate-700 dark:text-slate-300 mt-1">
                {agent.provenance.deploymentEnv}
              </dd>
            </div>
          </dl>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-slate-900 dark:text-slate-300 font-medium">
              Historical Behavior Baseline:
            </span>{' '}
            {agent.baselinePattern}
          </div>
        </section>

        {/* Delegated Mandates + Risk Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-4">
              Delegated Mandates ({agentMandates.length})
            </h2>
            {agentMandates.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No active mandates delegated to this agent.
              </p>
            ) : (
              <div className="space-y-3">
                {agentMandates.map((m) => (
                  <Link
                    key={m.id}
                    to={`/mandates/${m.id}`}
                    className="block p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1A] hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-cyan-700 dark:text-cyan-400">
                        {m.id}
                      </span>
                      <span>Limit {formatInr(m.maxAmountInr)}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-950 dark:text-slate-100 mt-1">
                      {m.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Accounts: {m.allowedAccounts.map((a) => `••••${a}`).join(', ')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-4">
              Active Risk Signals ({agent.riskSignals.length})
            </h2>
            {agent.riskSignals.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No active risk signals recorded for this agent.
              </p>
            ) : (
              <div className="space-y-3">
                {agent.riskSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1A]"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-medium">
                        {sig.category} · {sig.severity}
                      </span>
                      <span className="text-slate-500">{sig.detectedAt}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-950 dark:text-slate-100">
                      {sig.label}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {sig.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Decision History */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Recent Actions &amp; Decision History
            </h2>
            {agentSessions[0] && (
              <Link
                to={`/sessions?id=${agentSessions[0].id}`}
                className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium"
              >
                View Current Session ({agentSessions[0].id}) →
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/70">
            {agentTxs.map((tx) => (
              <Link
                key={tx.id}
                to={`/transactions/${tx.id}`}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {tx.id} · {tx.timestamp}
                  </div>
                  <div className="text-sm font-medium text-slate-950 dark:text-slate-100 mt-0.5">
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
