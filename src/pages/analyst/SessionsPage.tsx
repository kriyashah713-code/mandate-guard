import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator, RiskText } from '../../components/DecisionBadge';
import { useAppState } from '../../context/AppStateContext';
import { SETTLE_EASE } from '../../animations/scrollSystem';

export function SessionsPage() {
  const { sessions, agents, principals, mandates, transactions } = useAppState();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || sessions[0]?.id;
  const [selectedId, setSelectedId] = useState(initialId);
  const [replayKey, setReplayKey] = useState(0);

  const selected =
    sessions.find((s) => s.id === selectedId) || sessions[0];
  const agent = agents.find((a) => a.id === selected?.agentId);
  const principal = principals.find((p) => p.id === selected?.principalId);
  const mandate = mandates.find((m) => m.id === selected?.mandateId);
  const linkedTx = transactions.find((t) => t.sessionId === selected?.id);

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb="Risk Operations / Live Sessions"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Live Agent Session Investigation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time session telemetry, behavioral drift events, and chronological
            action timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Session List */}
          <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/80 shadow-xs dark:shadow-none">
            {sessions.map((ses) => {
              const ag = agents.find((a) => a.id === ses.agentId);
              const isSelected = ses.id === selected?.id;
              return (
                <button
                  key={ses.id}
                  type="button"
                  onClick={() => setSelectedId(ses.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-slate-800/80'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400">
                      {ses.id}
                    </span>
                    <DecisionIndicator decision={ses.decisionState} size="sm" />
                  </div>
                  <div className="text-sm font-medium text-slate-950 dark:text-slate-100 truncate">
                    {ag?.name || ses.agentId}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Started {ses.startedAt} · {ses.durationLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Session Detail & Timeline */}
          {selected && (
            <div className="lg:col-span-8 space-y-6">
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-cyan-700 dark:text-cyan-400">
                        {selected.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{selected.deviceClient}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selected.ipRegion}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                      {agent?.name}
                    </h2>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Principal:{' '}
                      <span className="text-slate-900 dark:text-slate-200">
                        {principal?.name}
                      </span>{' '}
                      · Mandate:{' '}
                      <Link
                        to={`/mandates/${mandate?.id}`}
                        className="font-mono text-cyan-700 dark:text-cyan-400 hover:underline"
                      >
                        {mandate?.id}
                      </Link>
                    </div>
                  </div>
                  <DecisionIndicator decision={selected.decisionState} size="lg" />
                </div>

                {/* Live Telemetry Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs text-slate-500">Current Trust</div>
                    <div className="text-lg font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-0.5">
                      {selected.currentTrust}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Mandate Fidelity
                    </div>
                    <div
                      className={`text-lg font-mono font-semibold tabular-nums mt-0.5 ${
                        selected.currentFidelity < 50
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {selected.currentFidelity}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Session Risk</div>
                    <div className="mt-1">
                      <RiskText risk={selected.currentRisk} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Duration</div>
                    <div className="text-lg font-mono text-slate-900 dark:text-slate-200 tabular-nums mt-0.5">
                      {selected.durationLabel}
                    </div>
                  </div>
                </div>

                {/* Behavioral Signals */}
                <div className="pt-5">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2.5">
                    Observed Behavioral Signals
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-800 dark:text-slate-300">
                    {selected.behavioralSignals.map((sig, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400 mt-0.5">
                          0{i + 1}
                        </span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Visual Session Timeline */}
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                    Chronological Session Timeline
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReplayKey((k) => k + 1)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:text-slate-950 dark:hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Replay Progression
                    </button>
                    {linkedTx && (
                      <Link
                        to={`/transactions/${linkedTx.id}`}
                        className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300"
                      >
                        Inspect {linkedTx.id} Decision →
                      </Link>
                    )}
                  </div>
                </div>

                <ol key={`${selected.id}-${replayKey}`} className="space-y-4">
                  {selected.timeline.map((ev, idx) => {
                    const dotColor =
                      ev.severity === 'CRITICAL'
                        ? 'bg-red-600 dark:bg-red-500'
                        : ev.severity === 'WARNING'
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : ev.severity === 'DECISION'
                            ? 'bg-cyan-600 dark:bg-cyan-400'
                            : 'bg-slate-400 dark:bg-slate-500';
                    return (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: idx * 0.08,
                          ease: SETTLE_EASE,
                        }}
                        className="flex items-start gap-4"
                      >
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 w-14 shrink-0 pt-0.5 tabular-nums">
                          {ev.time}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}
                        />
                        <div className="pb-3 border-b border-slate-200 dark:border-slate-800/60 flex-1">
                          <div className="text-sm font-medium text-slate-950 dark:text-slate-100">
                            {ev.label}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {ev.detail}
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
