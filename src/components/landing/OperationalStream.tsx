import { CheckCircle2, Clock, PauseCircle, ShieldAlert, ShieldX } from 'lucide-react';

export interface StreamEvent {
  time: string;
  title: string;
  detail: string;
  tone: 'neutral' | 'pass' | 'warn' | 'critical';
}

const STREAM_EVENTS: StreamEvent[] = [
  {
    time: '09:31:12',
    title: 'Agent authenticated',
    detail: 'mTLS session signed · Supplier Payment Agent (Trust 92/100)',
    tone: 'pass',
  },
  {
    time: '09:31:48',
    title: 'Invoice received',
    detail: 'ABC Industries · ₹1,40,000 supplier disbursement parsed',
    tone: 'neutral',
  },
  {
    time: '09:32:05',
    title: 'Destination changed',
    detail: 'Routing substituted from ••••4412 to unregistered ••••9087',
    tone: 'warn',
  },
  {
    time: '09:32:06',
    title: 'Mandate mismatch detected',
    detail: 'Authority gate failed against Mandate MND-8841 destination list',
    tone: 'critical',
  },
  {
    time: '09:32:07',
    title: 'Transaction held',
    detail: 'Pre-settlement hold placed prior to NEFT/IMPS release',
    tone: 'warn',
  },
  {
    time: '09:32:09',
    title: 'Customer confirmation requested',
    detail: 'Principal step-up challenge dispatched for ₹1,40,000 → ••••9087',
    tone: 'warn',
  },
  {
    time: '09:32:21',
    title: 'Customer rejected',
    detail: 'Principal selected [ NOT ME ] — unauthorized account confirmed',
    tone: 'critical',
  },
  {
    time: '09:32:22',
    title: 'Transaction blocked',
    detail: '₹1,40,000 exposure prevented · Forensic evidence sealed',
    tone: 'critical',
  },
];

export function OperationalStream({
  activeStep = 8,
  customerOutcome,
}: {
  activeStep?: number;
  customerOutcome?: 'pending' | 'approved' | 'rejected';
}) {
  const events = STREAM_EVENTS.map((ev, idx) => {
    if (customerOutcome === 'approved' && idx === 6) {
      return {
        ...ev,
        title: 'Customer confirmed',
        detail: 'Principal approved one-time beneficiary update via step-up',
        tone: 'pass' as const,
      };
    }
    if (customerOutcome === 'approved' && idx === 7) {
      return {
        ...ev,
        title: 'Transaction released',
        detail: 'Released with audited Principal step-up authorization',
        tone: 'pass' as const,
      };
    }
    return ev;
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] overflow-hidden shadow-xs dark:shadow-none">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-[#080D1A]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">
            REAL-LIFE EVENT LOG · SESSION KYA-2026-0941
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Pre-Settlement Inspection
        </span>
      </div>

      <div className="divide-y divide-slate-200/80 dark:divide-slate-800/70">
        {events.map((ev, idx) => {
          const reached = idx < activeStep;
          const isCurrent = idx === activeStep - 1;

          const toneText =
            ev.tone === 'critical'
              ? 'text-red-700 dark:text-red-400'
              : ev.tone === 'warn'
                ? 'text-amber-700 dark:text-amber-300'
                : ev.tone === 'pass'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-cyan-700 dark:text-cyan-300';

          const Icon =
            ev.tone === 'critical'
              ? idx === 7 && customerOutcome !== 'approved'
                ? ShieldX
                : ShieldAlert
              : ev.tone === 'warn'
                ? PauseCircle
                : CheckCircle2;

          return (
            <div
              key={ev.time}
              className={`px-5 py-3 flex items-start justify-between gap-4 transition-opacity duration-300 ${
                reached ? 'opacity-100' : 'opacity-35'
              } ${
                isCurrent
                  ? 'bg-cyan-50/60 dark:bg-cyan-950/20'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums pt-0.5 shrink-0">
                  {ev.time}
                </span>
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${toneText}`} />
                <div className="min-w-0">
                  <div className={`text-xs font-semibold ${toneText}`}>
                    {ev.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                    {ev.detail}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
