import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function CustomerSecurity() {
  const { user, principals, securityLogs } = useAppState();
  const principalId = user?.principalId || 'prin-mehta-01';
  const principal =
    principals.find((p) => p.id === principalId) || principals[0];
  const mySecurityLogs = securityLogs.filter(
    (log) => !log.principalId || log.principalId === principalId,
  );

  return (
    <WorkspaceLayout
      role="CUSTOMER"
      breadcrumb="Principal Workspace / Security & Profile"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Security Activity &amp; Principal Profile
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Corporate account baseline and chronological mandate enforcement log.
          </p>
        </div>

        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-4">
            Principal Profile &amp; Baseline
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Principal Name</dt>
              <dd className="text-slate-950 dark:text-slate-100 font-medium mt-1">
                {principal.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Entity</dt>
              <dd className="text-slate-950 dark:text-slate-100 mt-1">
                {principal.businessName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Primary Funding Account</dt>
              <dd className="font-mono text-slate-950 dark:text-slate-100 mt-1">
                {principal.accountNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Typical Operating Window</dt>
              <dd className="text-slate-800 dark:text-slate-200 mt-1">
                {principal.typicalHours}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Historical Avg Ticket</dt>
              <dd className="font-mono text-slate-950 dark:text-slate-100 mt-1">
                {formatInr(principal.historicalAvgTicketInr)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Registered Channels</dt>
              <dd className="font-mono text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                {principal.registeredChannels.join(', ')}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Security &amp; Mandate Audit Trail
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {mySecurityLogs.map((log) => (
              <div
                key={log.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{log.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>{log.actor}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-950 dark:text-slate-100 mt-0.5">
                    {log.event}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {log.detail}
                  </div>
                </div>
                <span
                  className={`font-mono text-xs shrink-0 font-medium ${
                    log.severity === 'CRITICAL'
                      ? 'text-red-700 dark:text-red-400'
                      : log.severity === 'WARNING'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {log.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
