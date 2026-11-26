import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { MandateDiff } from '../../components/MandateDiff';
import { MandateSpace } from '../../three/MandateSpace';
import { useAppState } from '../../context/AppStateContext';
import { SIMULATION_SCENARIOS } from '../../simulations/scenarios';
import type { Transaction } from '../../types/domain';
import { formatInr } from '../../utils/format';

export function SimulationsPage() {
  const { agents, mandates, principals, runSimulationScenario } = useAppState();
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    SIMULATION_SCENARIOS[4].id,
  );
  const [lastResultTx, setLastResultTx] = useState<Transaction | null>(null);

  const scenario =
    SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    SIMULATION_SCENARIOS[4];

  const handleRun = (id: string) => {
    setSelectedScenarioId(id);
    const tx = runSimulationScenario(id);
    setLastResultTx(tx);
  };

  const activeMandate =
    mandates.find((m) => m.id === (lastResultTx?.mandateId || scenario.mandateId)) ||
    mandates[0];
  const activeAgent =
    agents.find((a) => a.id === (lastResultTx?.agentId || scenario.agentId)) ||
    agents[0];
  const activePrincipal = principals.find(
    (p) => p.id === activeMandate.principalId,
  );

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb="Risk Operations / Simulation Lab"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Simulation Lab — 7 Live KYA Scenarios
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Trigger deterministic agent actions and inspect real-time Mandate
            Fidelity, Decision Engine output, 3D Mandate Space, and state
            updates across the platform.
          </p>
        </div>

        {/* 7 Scenarios Selector + Runner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl divide-y divide-slate-200 dark:divide-slate-800/80 overflow-hidden shadow-xs dark:shadow-none">
            {SIMULATION_SCENARIOS.map((sc) => {
              const isSelected = sc.id === scenario.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-slate-800/80'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-medium">
                      Scenario 0{sc.number} · {sc.agentType}
                    </span>
                    <DecisionIndicator decision={sc.expectedOutcome} size="sm" />
                  </div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-slate-100 mt-1">
                    {sc.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {sc.subtitle}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{sc.storyTag}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRun(sc.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-md hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Run Scenario
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Simulation Output */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                    Scenario 0{scenario.number} · {scenario.storyTag}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                    {scenario.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {scenario.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRun(scenario.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  Execute Live Evaluation
                </button>
              </div>

              {lastResultTx ? (
                <div className="pt-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <DecisionIndicator
                        decision={lastResultTx.decision.decision}
                        size="lg"
                      />
                      <div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Generated {lastResultTx.id} in{' '}
                          {lastResultTx.decision.evaluationLatencyMs}ms
                        </div>
                        <div className="text-sm text-slate-800 dark:text-slate-200">
                          {lastResultTx.decision.nextAction}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/transactions/${lastResultTx.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300"
                    >
                      Inspect Full Decision
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#070C1A] border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-500">Agent Trust</div>
                      <div className="font-mono text-base text-slate-950 dark:text-slate-100 mt-0.5 tabular-nums">
                        {lastResultTx.decision.agentTrust}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Mandate Fidelity</div>
                      <div
                        className={`font-mono text-base mt-0.5 tabular-nums ${
                          lastResultTx.decision.fidelityStatus === 'FAILED'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {lastResultTx.decision.mandateFidelity}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Behavior Drift</div>
                      <div className="font-mono text-base text-amber-700 dark:text-amber-300 mt-0.5 tabular-nums">
                        {lastResultTx.decision.behaviorDrift}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Amount</div>
                      <div className="font-mono text-base text-slate-950 dark:text-slate-100 mt-0.5 tabular-nums">
                        {formatInr(lastResultTx.amountInr)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Ranked Reason Codes
                    </div>
                    <ul className="space-y-2">
                      {lastResultTx.decision.reasonCodes.map((rc) => (
                        <li
                          key={rc.code}
                          className="text-xs p-3 rounded-lg bg-slate-50 dark:bg-[#070C1A] border border-slate-200 dark:border-slate-800"
                        >
                          <span className="font-mono text-cyan-700 dark:text-cyan-400 font-medium">
                            0{rc.rank} — {rc.title}
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {rc.detail}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="pt-6 text-sm text-slate-600 dark:text-slate-400">
                  Click{' '}
                  <strong className="text-slate-900 dark:text-slate-200">
                    Execute Live Evaluation
                  </strong>{' '}
                  to run Scenario 0{scenario.number} through the deterministic
                  KYA Decision Engine and inject the live transaction into the
                  workspace.
                </div>
              )}
            </div>

            <MandateSpace
              decision={
                lastResultTx?.decision.decision || scenario.expectedOutcome
              }
              hasViolation={
                lastResultTx
                  ? !lastResultTx.decision.authorityPass
                  : scenario.expectedOutcome !== 'ALLOW'
              }
              amountInr={scenario.input.amountInr}
              agentName={activeAgent.name}
              principalName={activePrincipal?.name || 'Principal'}
              registeredAccount={`••••${activeMandate.allowedAccounts[0] || '4412'}`}
              requestedAccount={`••••${scenario.input.destinationLast4}`}
              payee={scenario.input.payee}
              heightClass="h-[340px]"
            />

            {lastResultTx && (
              <MandateDiff
                mandate={activeMandate}
                transaction={lastResultTx}
                agent={activeAgent}
              />
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
