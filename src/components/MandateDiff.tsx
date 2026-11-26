import { AlertTriangle, Check, ShieldAlert, X } from 'lucide-react';
import type { Agent, Mandate, Transaction } from '../types/domain';
import { formatInr } from '../utils/format';

interface MandateDiffProps {
  mandate: Mandate;
  transaction: Transaction;
  agent?: Agent;
}

export function MandateDiff({ mandate, transaction, agent }: MandateDiffProps) {
  const amountOk = transaction.amountInr <= mandate.maxAmountInr;
  const payeeOk =
    mandate.allowedPayees.length === 0 ||
    mandate.allowedPayees.some(
      (p) => p.toLowerCase() === transaction.payee.toLowerCase(),
    );
  const destinationOk = mandate.allowedAccounts.includes(
    transaction.destinationAccountLast4,
  );
  const subAgentOk = !(
    transaction.subAgentRequested && !mandate.subAgentDelegationAllowed
  );

  return (
    <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl overflow-hidden shadow-xs dark:shadow-none">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-cyan-700 dark:text-cyan-400 font-medium mb-0.5">
            Forensic Boundary Comparison
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Mandate Diff — Delegated Authority vs Requested Action
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Unit: ({agent?.name || transaction.agentId}, {mandate.id}, {transaction.id})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* LEFT: WHAT THE CUSTOMER DELEGATED */}
        <div className="p-6 bg-slate-50/70 dark:bg-[#080D1A]">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              WHAT THE CUSTOMER DELEGATED (MANDATE)
            </span>
            <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400">
              {mandate.id}
            </span>
          </div>

          <dl className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Purpose
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-100 text-right max-w-xs">
                {mandate.purpose}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Maximum Per Invoice
              </dt>
              <dd className="text-sm font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {formatInr(mandate.maxAmountInr)}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Allowed Payees
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-100 text-right">
                {mandate.allowedPayees.join(', ')}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Registered Destination Accounts
              </dt>
              <dd className="text-sm font-mono text-emerald-700 dark:text-emerald-300 text-right font-medium">
                {mandate.allowedAccounts.map((a) => `••••${a}`).join('  ·  ')}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Sub-Agent Delegation
              </dt>
              <dd className="text-sm font-mono text-slate-800 dark:text-slate-200">
                {mandate.subAgentDelegationAllowed ? 'Permitted' : 'Prohibited'}
              </dd>
            </div>
          </dl>
        </div>

        {/* RIGHT: WHAT THE AGENT IS TRYING TO DO */}
        <div className="p-6 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
              WHAT THE AGENT IS TRYING TO DO (CURRENT ACTION)
            </span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              {transaction.id}
            </span>
          </div>

          <dl className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Requested Purpose
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-100 text-right max-w-xs">
                {transaction.purpose}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Requested Amount
              </dt>
              <dd
                className={`text-sm font-mono tabular-nums inline-flex items-center gap-2 ${
                  amountOk
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatInr(transaction.amountInr)}
                {amountOk ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/70">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Requested Supplier / Payee
              </dt>
              <dd
                className={`text-sm inline-flex items-center gap-2 ${
                  payeeOk
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {transaction.payee}
                {payeeOk ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </dd>
            </div>

            <div
              className={`flex items-start justify-between gap-4 p-3 rounded-lg border ${
                destinationOk
                  ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5'
                  : 'border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10'
              }`}
            >
              <div>
                <dt className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Requested Destination Account
                </dt>
                {!destinationOk && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Registered supplier account is ••••
                    {transaction.registeredExpectedLast4}
                  </p>
                )}
              </div>
              <dd
                className={`text-sm font-mono font-semibold inline-flex items-center gap-2 ${
                  destinationOk
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {transaction.destinationAccount}
                {destinationOk ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Sub-Agent Execution
              </dt>
              <dd
                className={`text-sm font-mono inline-flex items-center gap-2 ${
                  subAgentOk
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {transaction.subAgentRequested
                  ? transaction.subAgentName || 'External Sub-Agent'
                  : 'Direct Bound Agent'}
                {subAgentOk ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {transaction.decision.hardAuthorityOverrideBlocked && (
        <div className="px-6 py-3.5 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900/50 flex items-center gap-3 text-xs text-red-800 dark:text-red-200">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>
            <strong className="font-semibold text-red-900 dark:text-red-100">
              Hard Authority Rule Enforced:
            </strong>{' '}
            Agent Trust ({transaction.decision.agentTrust}/100) and Amount Limit (
            {formatInr(transaction.amountInr)} ≤ {formatInr(mandate.maxAmountInr)})
            passed, but{' '}
            <span className="font-mono">
              {transaction.decision.authorityNote}
            </span>
            . High agent trust cannot override a mandate boundary violation.
          </span>
        </div>
      )}
    </section>
  );
}
