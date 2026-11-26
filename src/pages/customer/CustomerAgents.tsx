import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { useAppState } from '../../context/AppStateContext';

export function CustomerAgents() {
  const { user, agents, mandates, updateAgentStatus } = useAppState();
  const principalId = user?.principalId || 'prin-mehta-01';
  const myAgents = agents.filter((a) => a.principalId === principalId);

  return (
    <WorkspaceLayout role="CUSTOMER" breadcrumb="Principal Workspace / My Agents">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Authorized &amp; Observed Agents
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Provenance certificates, trust history, bound mandates, and instant
            revocation controls for agents operating on your account.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Agent</th>
                  <th className="py-3.5 px-4 font-medium">Classification</th>
                  <th className="py-3.5 px-4 font-medium">Provenance Issuer</th>
                  <th className="py-3.5 px-4 font-medium">Bound Mandates</th>
                  <th className="py-3.5 px-4 font-medium text-right">Trust</th>
                  <th className="py-3.5 px-4 font-medium text-right">Status</th>
                  <th className="py-3.5 px-6 font-medium text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {myAgents.map((agent) => {
                  const bound = mandates.filter((m) => m.agentId === agent.id);
                  const isSuspended = agent.status === 'SUSPENDED';
                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-950 dark:text-slate-100">
                          {agent.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {agent.handle}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {agent.type}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 dark:text-slate-300">
                        <div>{agent.provenance.issuer}</div>
                        <div className="text-slate-500 font-mono">
                          {agent.provenance.sdkVersion}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-cyan-700 dark:text-cyan-300">
                        {bound.length > 0
                          ? bound.map((m) => m.id).join(', ')
                          : 'None bound'}
                      </td>
                      <td className="py-4 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                        {agent.trustScore}/100
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs">
                        <span
                          className={
                            agent.status === 'ACTIVE'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : agent.status === 'SUSPENDED'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {agent.type !== 'HUMAN' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateAgentStatus(
                                agent.id,
                                isSuspended ? 'ACTIVE' : 'SUSPENDED',
                              )
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                              isSuspended
                                ? 'border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                : 'border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10'
                            }`}
                          >
                            {isSuspended ? 'Restore Agent' : 'Revoke Agent'}
                          </button>
                        )}
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
