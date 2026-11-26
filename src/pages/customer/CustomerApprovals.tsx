import { CheckCircle2, ShieldX, AlertTriangle } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator } from '../../components/DecisionBadge';
import { MandateDiff } from '../../components/MandateDiff';
import { useAppState } from '../../context/AppStateContext';
import { formatCompactInr, formatInr } from '../../utils/format';

export function CustomerApprovals() {
  const { user, transactions, mandates, agents, respondToStepUp, cases } =
    useAppState();
  const principalId = user?.principalId || 'prin-mehta-01';

  const stepUpQueue = transactions.filter(
    (t) =>
      t.principalId === principalId &&
      (t.customerApprovalStatus === 'PENDING' ||
        t.customerApprovalStatus === 'REJECTED' ||
        t.customerApprovalStatus === 'APPROVED'),
  );

  return (
    <WorkspaceLayout
      role="CUSTOMER"
      breadcrumb="Principal Workspace / Step-Up Approvals"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Step-Up Verification Requests
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            When an agent requests an action outside your delegated mandate,
            Mandate Guard freezes settlement and asks for your direct confirmation.
          </p>
        </div>

        {stepUpQueue.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-10 text-center shadow-xs dark:shadow-none">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              No pending Step-Up challenges
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              All agent actions are currently aligned with your delegated mandates.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {stepUpQueue.map((tx) => {
              const mandate = mandates.find((m) => m.id === tx.mandateId);
              const agent = agents.find((a) => a.id === tx.agentId);
              const linkedCase = cases.find((c) => c.transactionId === tx.id);
              const isPending = tx.customerApprovalStatus === 'PENDING';

              return (
                <div key={tx.id} className="space-y-5">
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <DecisionIndicator decision={tx.decision.decision} />
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {tx.id} · {tx.timestamp}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                          {formatInr(tx.amountInr)} requested for {tx.payee} (
                          {tx.destinationAccount})
                        </h2>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#070C1A] border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                          {tx.customerPlainExplanation}
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0">
                        {isPending ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => respondToStepUp(tx.id, 'REJECT')}
                              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap"
                            >
                              <ShieldX className="w-4 h-4" />
                              NOT ME — Reject &amp; Block
                            </button>
                            <button
                              type="button"
                              onClick={() => respondToStepUp(tx.id, 'APPROVE')}
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap"
                            >
                              Approve Exception
                            </button>
                          </div>
                        ) : tx.customerApprovalStatus === 'REJECTED' ? (
                          <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-right">
                            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              Principal Rejected (&ldquo;NOT ME&rdquo;) → BLOCKED
                            </div>
                            <div className="text-lg font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
                              {formatCompactInr(tx.amountInr)} Loss Prevented
                            </div>
                            {linkedCase && (
                              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                                Fraud Case {linkedCase.id} opened
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                            Exception approved by Principal
                          </div>
                        )}
                      </div>
                    </div>

                    {tx.externalInstructionDetected && (
                      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{tx.externalInstructionNote}</span>
                      </div>
                    )}
                  </div>

                  {mandate && (
                    <MandateDiff
                      mandate={mandate}
                      transaction={tx}
                      agent={agent}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
