import { Link } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function MandatesPage() {
  const { mandates, principals, agents } = useAppState();

  return (
    <WorkspaceLayout role="ANALYST" breadcrumb="Risk Operations / Mandates">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Delegated Authority Mandates
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect active customer mandates, hard boundary rules, and drift
            alerts.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Mandate</th>
                  <th className="py-3.5 px-4 font-medium">Principal</th>
                  <th className="py-3.5 px-4 font-medium">Bound Agent</th>
                  <th className="py-3.5 px-4 font-medium">Allowed Accounts</th>
                  <th className="py-3.5 px-4 font-medium text-right">Ceiling</th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Violations
                  </th>
                  <th className="py-3.5 px-6 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {mandates.map((m) => {
                  const p = principals.find((pr) => pr.id === m.principalId);
                  const a = agents.find((ag) => ag.id === m.agentId);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-950 dark:text-slate-100">
                          {m.title}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {m.id} · {m.status}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {p?.name || m.principalId}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {a?.name || m.agentId}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-emerald-700 dark:text-emerald-300">
                        {m.allowedAccounts.map((acc) => `••••${acc}`).join(' · ')}
                      </td>
                      <td className="py-4 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                        {formatInr(m.maxAmountInr)}
                      </td>
                      <td
                        className={`py-4 px-4 font-mono text-right tabular-nums ${
                          m.violationsDetected > 0
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {m.violationsDetected}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/mandates/${m.id}`}
                          className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 whitespace-nowrap"
                        >
                          Boundary View →
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
