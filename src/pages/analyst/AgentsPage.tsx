import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { useAppState } from '../../context/AppStateContext';
import type { AgentType } from '../../types/domain';

export function AgentsPage() {
  const { agents, principals } = useAppState();
  const [typeFilter, setTypeFilter] = useState<'ALL' | AgentType>('ALL');

  const filtered =
    typeFilter === 'ALL'
      ? agents
      : agents.filter((a) => a.type === typeFilter);

  return (
    <WorkspaceLayout role="ANALYST" breadcrumb="Risk Operations / Agents">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              Know Your Agent (KYA) Registry
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Distinguish verified LLM agents, human sessions, human-mimicking
              scripts, and unattested bots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg">
            {(
              [
                'ALL',
                'LLM_AGENT',
                'HUMAN',
                'HUMAN_MIMICKING_AGENT',
                'SCRIPTED_BOT',
              ] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Agent Identity</th>
                  <th className="py-3.5 px-4 font-medium">Agent Type</th>
                  <th className="py-3.5 px-4 font-medium">Principal</th>
                  <th className="py-3.5 px-4 font-medium">Provenance</th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Trust Score
                  </th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Violations
                  </th>
                  <th className="py-3.5 px-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {filtered.map((ag) => {
                  const p = principals.find((pr) => pr.id === ag.principalId);
                  return (
                    <tr
                      key={ag.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-950 dark:text-slate-100">
                          {ag.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {ag.id} · {ag.status}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-cyan-700 dark:text-cyan-300">
                        {ag.type}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {p?.name || ag.principalId}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <div>{ag.provenance.issuer}</div>
                        <div className="font-mono text-slate-500">
                          {ag.provenance.sdkVersion}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                        {ag.trustScore}/100
                      </td>
                      <td
                        className={`py-4 px-4 font-mono text-right tabular-nums ${
                          ag.violationCount > 0
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {ag.violationCount}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/agents/${ag.id}`}
                          className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 whitespace-nowrap"
                        >
                          Investigate →
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
