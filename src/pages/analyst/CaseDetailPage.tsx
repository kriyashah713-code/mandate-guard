import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import type { FraudCase } from '../../types/domain';
import { formatInr } from '../../utils/format';

export function CaseDetailPage() {
  const { id } = useParams();
  const { cases, agents, principals, mandates, updateFraudCase } =
    useAppState();

  const fc = cases.find((c) => c.id === id) || cases[0];
  const agent = agents.find((a) => a.id === fc.agentId);
  const principal = principals.find((p) => p.id === fc.principalId);
  const mandate = mandates.find((m) => m.id === fc.mandateId);

  const [notes, setNotes] = useState(fc.analystNotes);
  const [savedFlag, setSavedFlag] = useState(false);

  const handleSaveNotes = () => {
    updateFraudCase(fc.id, { analystNotes: notes });
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2000);
  };

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb={`Risk Operations / Fraud Cases / ${fc.id}`}
      action={
        <Link
          to="/cases"
          className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg"
        >
          Back to Fraud Cases
        </Link>
      }
    >
      <div className="space-y-8">
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                  {fc.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Opened {fc.openedAt}</span>
                <span aria-hidden="true">·</span>
                <span>Analyst: {fc.assignedAnalyst}</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                Mandate Violation Case — {fc.transactionId}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Principal: {principal?.name} · Agent:{' '}
                <Link
                  to={`/agents/${agent?.id}`}
                  className="text-cyan-700 dark:text-cyan-400 hover:underline"
                >
                  {agent?.name}
                </Link>{' '}
                · Mandate:{' '}
                <Link
                  to={`/mandates/${mandate?.id}`}
                  className="font-mono text-cyan-700 dark:text-cyan-400 hover:underline"
                >
                  {mandate?.id}
                </Link>
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Financial Exposure
                </div>
                <div className="text-lg font-mono text-slate-900 dark:text-slate-200 tabular-nums">
                  {formatInr(fc.financialExposureInr)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  Loss Prevented
                </div>
                <div className="text-2xl font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatInr(fc.lossPreventedInr)}
                </div>
              </div>
              <DecisionIndicator decision={fc.decision} size="lg" />
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Case Status:
              </span>
              {(
                [
                  'OPEN',
                  'UNDER_INVESTIGATION',
                  'RESOLVED_PREVENTED',
                  'DISMISSED',
                ] as FraudCase['status'][]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateFraudCase(fc.id, { status: st })}
                  className={`px-2.5 py-1 rounded-md font-mono transition-colors ${
                    fc.status === st
                      ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <Link
              to={`/transactions/${fc.transactionId}`}
              className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:underline"
            >
              View Linked Transaction Decision →
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 space-y-4 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Reason Codes &amp; Evidence Summary
            </h2>
            <div className="space-y-3">
              {fc.reasonCodes.map((rc) => (
                <div
                  key={rc.code}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1A]"
                >
                  <div className="font-mono text-xs text-cyan-700 dark:text-cyan-400">
                    0{rc.rank} · {rc.code}
                  </div>
                  <div className="text-sm font-medium text-slate-950 dark:text-slate-100 mt-0.5">
                    {rc.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {rc.detail}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 space-y-4 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Analyst Investigation Notes
            </h2>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 text-sm bg-slate-50 dark:bg-[#050914] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                {savedFlag ? 'Notes saved to case record.' : ''}
              </span>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors"
              >
                Save Analyst Notes
              </button>
            </div>

            {fc.timeline.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  CAPTURED SESSION TIMELINE
                </h3>
                <ol className="space-y-2.5 text-xs">
                  {fc.timeline.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="font-mono text-slate-500 w-12 shrink-0">
                        {ev.time}
                      </span>
                      <span className="text-slate-900 dark:text-slate-200 font-medium">
                        {ev.label}:
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {ev.detail}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
