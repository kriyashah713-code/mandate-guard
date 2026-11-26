import { AlertCircle } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { SIMULATED_EVALUATION_METRICS } from '../../data/mockData';
import { formatInr } from '../../utils/format';

export function EvaluationPage() {
  const m = SIMULATED_EVALUATION_METRICS;

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb="Risk Operations / Evaluation Methodology"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Evaluation Methodology &amp; Expected-Cost Benchmark
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Comparing Mandate Guard against Allow-All and Simple Limit-Rule
            baselines on agent delegation safety.
          </p>
        </div>

        {/* Explicit Simulated Disclaimer Banner */}
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="font-semibold">Simulated Prototype Metrics:</strong>{' '}
            {m.disclaimer}. These numbers illustrate expected-cost evaluation
            methodology rather than production bank deployment telemetry.
          </span>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 shadow-xs dark:shadow-none">
          <div className="p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Macro-F1 (Simulated)
            </div>
            <div className="text-2xl font-mono font-semibold text-cyan-700 dark:text-cyan-300 tabular-nums mt-1.5">
              {m.macroF1.toFixed(3)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ROC-AUC (Simulated)
            </div>
            <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-1.5">
              {m.rocAuc.toFixed(3)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              PR-AUC (Simulated)
            </div>
            <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-1.5">
              {m.prAuc.toFixed(3)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Latency p50 / p95
            </div>
            <div className="text-2xl font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1.5">
              {m.p50LatencyMs} / {m.p95LatencyMs} ms
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Reason-Code Coverage
            </div>
            <div className="text-2xl font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-1.5">
              {m.reasonCodeCoverage.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Expected Cost / 1000 Sessions Comparison */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Expected Cost per 1,000 Agent Sessions (Simulated)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Combines unmitigated fraud loss with false-positive step-up
              customer friction.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">System / Baseline</th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Expected Cost / 1k Sessions
                  </th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Violation Catch Rate
                  </th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Customer Friction
                  </th>
                  <th className="py-3.5 px-6 font-medium text-right">
                    Catches Account Substitution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {m.expectedCostComparison.map((row, idx) => (
                  <tr
                    key={row.system}
                    className={
                      idx === 2
                        ? 'bg-cyan-50/60 dark:bg-cyan-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }
                  >
                    <td className="py-4 px-6 font-medium text-slate-950 dark:text-slate-100">
                      {row.system}
                    </td>
                    <td
                      className={`py-4 px-4 font-mono text-right tabular-nums ${
                        idx === 2
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatInr(row.expectedCostPer1000SessionsInr)}
                    </td>
                    <td className="py-4 px-4 font-mono text-right text-slate-800 dark:text-slate-200 tabular-nums">
                      {row.fraudCatchRate}
                    </td>
                    <td className="py-4 px-4 font-mono text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      {row.falsePositiveFriction}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-xs">
                      <span
                        className={
                          row.catchesAccountSubstitution
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-red-700 dark:text-red-400'
                        }
                      >
                        {row.catchesAccountSubstitution ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Per-Class Recall */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Per-Class Recall &amp; Precision (Simulated Benchmark)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#080D1A]">
                  <th className="py-3.5 px-6 font-medium">Decision Class</th>
                  <th className="py-3.5 px-4 font-medium text-right">Recall</th>
                  <th className="py-3.5 px-4 font-medium text-right">
                    Precision
                  </th>
                  <th className="py-3.5 px-6 font-medium text-right">
                    Simulated Support
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-sm">
                {m.perClassRecall.map((cls) => (
                  <tr key={cls.label}>
                    <td className="py-3.5 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                      {cls.label}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-950 dark:text-slate-100 tabular-nums">
                      {(cls.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-800 dark:text-slate-200 tabular-nums">
                      {(cls.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 font-mono text-right text-slate-600 dark:text-slate-400 tabular-nums">
                      {cls.support.toLocaleString('en-IN')}
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
