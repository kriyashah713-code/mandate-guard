import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/PublicLayout';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Customer delegates structured authority',
    detail:
      'The principal defines a machine-verifiable mandate: exact business purpose, per-action ceiling, daily cap, registered payees, registered destination accounts, and sub-agent rules.',
  },
  {
    step: '02',
    title: 'Agent identity & provenance captured',
    detail:
      'Every session captures cryptographic SDK provenance and separates human sessions, verified LLM agents, human-mimicking scripts, and scripted bots.',
  },
  {
    step: '03',
    title: 'Action-by-action Authority & Fidelity check',
    detail:
      'At transaction time, Mandate Guard checks whether the action remains strictly inside the delegated envelope. High trust can never override a hard boundary violation.',
  },
  {
    step: '04',
    title: 'Behavior drift & expected-cost decision',
    detail:
      'Session drift signals combine with financial exposure to route each action to ALLOW, STEP-UP (customer check), HOLD (analyst review), or BLOCK.',
  },
  {
    step: '05',
    title: 'Ranked Reason Codes & Fraud Evidence',
    detail:
      'Analysts receive ranked plain-language reason codes, Mandate Diff forensics, and immutable timeline evidence to open fraud cases and prevent loss.',
  },
];

export function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="max-w-[1120px] mx-auto px-6 py-16 space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
            Core Verification Pipeline
          </p>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-slate-950 dark:text-slate-100">
            From Principal Delegation to Action-Level Enforcement
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Mandate Guard inserts a deterministic verification boundary between
            autonomous agents and bank settlement rails.
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl divide-y divide-slate-200 dark:divide-slate-800 shadow-xs dark:shadow-none">
          {WORKFLOW_STEPS.map((item) => (
            <div
              key={item.step}
              className="p-6 flex flex-col sm:flex-row sm:items-start gap-5"
            >
              <div className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-400 w-10 shrink-0">
                {item.step}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              state: 'ALLOW',
              color:
                'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
              desc: 'Authority, Fidelity, and Behavior align. Settlement proceeds uninterrupted.',
            },
            {
              state: 'STEP-UP',
              color:
                'text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
              desc: 'Action pauses at boundary; plain-language confirmation routed to Principal.',
            },
            {
              state: 'HOLD',
              color:
                'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
              desc: 'High-exposure drift frozen in Risk Operations queue pending verification.',
            },
            {
              state: 'BLOCK',
              color:
                'text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
              desc: 'Hard authority failure or customer rejection; intercepted and case logged.',
            },
          ].map((d) => (
            <div
              key={d.state}
              className={`p-5 rounded-xl border bg-white dark:bg-[#0B1120] shadow-xs dark:shadow-none ${d.color}`}
            >
              <div className="font-mono text-sm font-semibold">{d.state}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/demo"
            className="px-5 py-2.5 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors"
          >
            Experience the Flagship Demo
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 rounded-lg hover:border-slate-400 dark:hover:border-slate-500"
          >
            Sign In to Workspace
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
