import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/PublicLayout';

const USE_CASES = [
  {
    title: '01. Automated Corporate Supplier Autopay',
    context: 'ERP & GST Invoice Agents',
    risk: 'Prompt-injected PDF invoices alter beneficiary bank accounts while keeping amounts below per-invoice ceilings.',
    control:
      'Mandate Guard binds each approved supplier to registered account numbers (••••4412) and intercepts any substituted account (••••9087).',
  },
  {
    title: '02. Fleet & Logistics Treasury Sweeping',
    context: 'Supply-Chain Disbursement Copilots',
    risk: 'Compromised agent credentials or rogue sub-agents attempt off-hours transfers to unlisted offshore entities.',
    control:
      'Hard payee allowlists, time-window baselines, and sub-agent prohibition block scope widening before settlement.',
  },
  {
    title: '03. Browser Session Human-Mimicry Defense',
    context: 'Retail & SME Web Banking',
    risk: 'Malicious browser extensions replay DOM clicks at synthetic intervals to impersonate the human account holder.',
    control:
      'Behavioral cadence telemetry flags HUMAN_MIMICKING_AGENT sessions and forces out-of-band biometric STEP-UP.',
  },
  {
    title: '04. Headless Scripted Bot Interception',
    context: 'Open-Banking & Payment APIs',
    risk: 'Unattested scripts probe payment APIs at high velocity using stolen tokens.',
    control:
      'Missing KYA provenance certificates trigger immediate BLOCK and automated fraud case generation.',
  },
];

export function UseCasesPage() {
  return (
    <PublicLayout>
      <section className="max-w-[1120px] mx-auto px-6 py-16 space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
            Banking &amp; Enterprise Deployments
          </p>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-slate-950 dark:text-slate-100">
            Built for Indian Corporate &amp; Retail Agentic Payments
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Protecting NEFT, RTGS, IMPS, and corporate ERP payment rails as
            enterprises adopt autonomous finance agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-3 shadow-xs dark:shadow-none"
            >
              <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
                {uc.context}
              </div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                {uc.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-200">
                  Threat:
                </strong>{' '}
                {uc.risk}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">
                  Enforcement:
                </strong>{' '}
                {uc.control}
              </p>
            </div>
          ))}
        </div>

        <div>
          <Link
            to="/login"
            className="inline-flex px-5 py-2.5 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors"
          >
            Test Scenarios in Analyst Workspace
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
