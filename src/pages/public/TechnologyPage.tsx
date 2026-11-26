import { PublicLayout } from '../../components/PublicLayout';

export function TechnologyPage() {
  return (
    <PublicLayout>
      <section className="max-w-[1120px] mx-auto px-6 py-16 space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
            Decision Architecture
          </p>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-slate-950 dark:text-slate-100">
            Five Orthogonal Signals. Zero Single-Score Collapse.
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Legacy risk systems average identity, amount, and velocity into a
            single opaque number. Mandate Guard evaluates five distinct axes so
            a trusted agent cannot smuggle an unauthorized destination account.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-[#080D1A]">
                <th className="py-3.5 px-6 font-medium">Dimension</th>
                <th className="py-3.5 px-4 font-medium">Question Answered</th>
                <th className="py-3.5 px-6 font-medium">
                  Hard Rule Interaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
              <tr>
                <td className="py-4 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                  1. Authority
                </td>
                <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                  Is the agent bound to an active mandate permitting this payee,
                  account, channel, and amount?
                </td>
                <td className="py-4 px-6 text-xs text-red-700 dark:text-red-300">
                  Hard boundary — failure cannot be overridden by high trust.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                  2. Agent Trust
                </td>
                <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                  How trustworthy is the agent itself via provenance and prior
                  verified actions?
                </td>
                <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                  Informs baseline friction; strictly subordinate to Authority.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                  3. Mandate Fidelity
                </td>
                <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                  Does this specific action align with the customer&apos;s
                  stated delegated purpose?
                </td>
                <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                  Drives Mandate Diff highlights and ranked reason codes.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                  4. Behavior Drift
                </td>
                <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                  Did an external prompt, mid-session edit, or synthetic cadence
                  alter agent behavior?
                </td>
                <td className="py-4 px-6 text-xs text-amber-700 dark:text-amber-300">
                  Soft signals can only escalate risk; never downgrade a breach.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                  5. Expected Cost
                </td>
                <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                  What is the expected fraud loss vs false-positive customer
                  friction?
                </td>
                <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                  Routes outcome cleanly between ALLOW, STEP-UP, HOLD, and
                  BLOCK.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PublicLayout>
  );
}
