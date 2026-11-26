import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function CustomerMandates() {
  const {
    user,
    mandates,
    agents,
    createMandate,
    updateMandateStatus,
    updateMandateLimit,
  } = useAppState();
  const principalId = user?.principalId || 'prin-mehta-01';
  const myMandates = mandates.filter((m) => m.principalId === principalId);
  const myAgents = agents.filter((a) => a.principalId === principalId);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('Registered Vendor GST Autopay');
  const [agentId, setAgentId] = useState(myAgents[0]?.id || 'agt-payops-01');
  const [purpose, setPurpose] = useState(
    'Pay verified supplier invoices to registered bank accounts',
  );
  const [maxAmountInr, setMaxAmountInr] = useState('150000');
  const [dailyLimitInr, setDailyLimitInr] = useState('450000');
  const [payeesInput, setPayeesInput] = useState(
    'ABC Industries, Sahyadri Packaging',
  );
  const [accountsInput, setAccountsInput] = useState('4412, 5109');
  const [subAgentAllowed, setSubAgentAllowed] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMandate({
      title: title.trim() || 'Delegated Payment Mandate',
      agentId,
      purpose: purpose.trim(),
      maxAmountInr: Math.max(1000, Number(maxAmountInr) || 100000),
      dailyLimitInr: Math.max(5000, Number(dailyLimitInr) || 300000),
      frequencyLimit: 'Up to 6 invoices / day',
      allowedPayees: payeesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allowedAccounts: accountsInput
        .split(',')
        .map((s) => s.replace(/[^0-9]/g, '').slice(-4))
        .filter((s) => s.length === 4),
      subAgentDelegationAllowed: subAgentAllowed,
    });
    setShowForm(false);
  };

  const inputClass =
    'w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#050914] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400';

  return (
    <WorkspaceLayout
      role="CUSTOMER"
      breadcrumb="Principal Workspace / My Mandates"
      action={
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Create Mandate'}
        </button>
      }
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Delegated Authority Mandates
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Define strict transaction ceilings, allowed merchants, and registered
            destination accounts for every AI agent acting on your behalf.
          </p>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="border border-cyan-300 dark:border-cyan-500/40 bg-white dark:bg-[#0B1120] rounded-xl p-6 space-y-5 shadow-xs dark:shadow-none"
          >
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
              Define New Delegated Mandate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Mandate Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Assigned Agent
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className={inputClass}
                >
                  {myAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Delegated Purpose
                </label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Max Amount Per Action (INR)
                </label>
                <input
                  type="number"
                  value={maxAmountInr}
                  onChange={(e) => setMaxAmountInr(e.target.value)}
                  className={`${inputClass} font-mono`}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Daily Aggregate Ceiling (INR)
                </label>
                <input
                  type="number"
                  value={dailyLimitInr}
                  onChange={(e) => setDailyLimitInr(e.target.value)}
                  className={`${inputClass} font-mono`}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Allowed Payees / Merchants (comma-separated)
                </label>
                <input
                  value={payeesInput}
                  onChange={(e) => setPayeesInput(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  Registered Account Last-4 Digits (comma-separated)
                </label>
                <input
                  value={accountsInput}
                  onChange={(e) => setAccountsInput(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={subAgentAllowed}
                onChange={(e) => setSubAgentAllowed(e.target.checked)}
                className="rounded border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-500"
              />
              Allow sub-agent delegation (not recommended)
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:text-slate-950 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400"
              >
                Activate Mandate
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {myMandates.map((m) => {
            const agent = agents.find((a) => a.id === m.agentId);
            return (
              <div
                key={m.id}
                className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-cyan-700 dark:text-cyan-400">
                        {m.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Bound to {agent?.name || m.agentId}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono font-medium ${
                          m.status === 'ACTIVE'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : m.status === 'PAUSED'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100 mt-1">
                      {m.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {m.purpose}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateMandateLimit(
                          m.id,
                          m.maxAmountInr === 200000 ? 250000 : 200000,
                        )
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      Adjust Limit
                    </button>
                    {m.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => updateMandateStatus(m.id, 'PAUSED')}
                        className="px-3 py-1.5 text-xs font-medium border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        Pause
                      </button>
                    ) : (
                      m.status === 'PAUSED' && (
                        <button
                          type="button"
                          onClick={() => updateMandateStatus(m.id, 'ACTIVE')}
                          className="px-3 py-1.5 text-xs font-medium border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                          Resume
                        </button>
                      )
                    )}
                    {m.status !== 'REVOKED' && (
                      <button
                        type="button"
                        onClick={() => updateMandateStatus(m.id, 'REVOKED')}
                        className="px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-5 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Per-Action Limit</div>
                    <div className="font-mono text-slate-950 dark:text-slate-100 tabular-nums mt-1">
                      {formatInr(m.maxAmountInr)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Allowed Payees</div>
                    <div className="text-slate-800 dark:text-slate-200 mt-1">
                      {m.allowedPayees.join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Registered Accounts
                    </div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                      {m.allowedAccounts.map((a) => `••••${a}`).join(' · ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Sub-Agent Delegation
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-300 mt-1">
                      {m.subAgentDelegationAllowed ? 'Permitted' : 'Prohibited'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
