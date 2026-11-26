import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  PauseCircle,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { WorkspaceLayout } from '../../components/WorkspaceLayout';
import { DecisionIndicator, RiskText } from '../../components/DecisionBadge';
import { MandateDiff } from '../../components/MandateDiff';
import { MandateSpace } from '../../three/MandateSpace';
import { useAppState } from '../../context/AppStateContext';
import { formatInr } from '../../utils/format';

export function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    transactions,
    agents,
    principals,
    mandates,
    cases,
    analystOverrideTransaction,
    openFraudCaseForTransaction,
  } = useAppState();

  const tx = transactions.find((t) => t.id === id) || transactions[0];
  const agent = agents.find((a) => a.id === tx.agentId);
  const principal = principals.find((p) => p.id === tx.principalId);
  const mandate = mandates.find((m) => m.id === tx.mandateId);
  const existingCase = cases.find((c) => c.transactionId === tx.id);

  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(
    tx.evidence[0]?.id || null,
  );
  const [analystNote, setAnalystNote] = useState('');

  const handleOpenCase = () => {
    const fc = openFraudCaseForTransaction(
      tx.id,
      analystNote.trim() || undefined,
    );
    navigate(`/cases/${fc.id}`);
  };

  return (
    <WorkspaceLayout
      role="ANALYST"
      breadcrumb={`Risk Operations / Transactions / ${tx.id}`}
      action={
        <div className="flex items-center gap-2">
          <Link
            to="/transactions"
            className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            All Transactions
          </Link>
          {existingCase && (
            <Link
              to={`/cases/${existingCase.id}`}
              className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              View Case {existingCase.id}
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top Decision Command Bar */}
        <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {tx.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Sequence #{tx.sequenceNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{tx.timestamp}</span>
                <span aria-hidden="true">·</span>
                <span>Channel {tx.channel}</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 mt-1.5">
                {formatInr(tx.amountInr)} → {tx.payee}{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  ({tx.destinationAccount})
                </span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Principal:{' '}
                <span className="text-slate-900 dark:text-slate-200">
                  {principal?.name}
                </span>{' '}
                · Agent:{' '}
                <Link
                  to={`/agents/${agent?.id}`}
                  className="text-cyan-700 dark:text-cyan-400 hover:underline"
                >
                  {agent?.name}
                </Link>{' '}
                · Mandate:{' '}
                <Link
                  to={`/mandates/${mandate?.id}`}
                  className="font-mono text-cyan-700 dark:text-cyan-400 hover:underline"
                >
                  {mandate?.id}
                </Link>
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
              <DecisionIndicator decision={tx.decision.decision} size="lg" />
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {tx.decision.nextAction}
              </div>
            </div>
          </div>

          {/* 5-Axis KYA Evaluation Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500">1. Authority</div>
              <div
                className={`text-base font-mono font-semibold mt-1 ${
                  tx.decision.authorityPass
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                {tx.decision.authorityPass ? 'PASS' : 'FAILED'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hard boundary check
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">2. Agent Trust</div>
              <div className="text-base font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-1">
                {tx.decision.agentTrust}/100
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identity &amp; history
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">3. Mandate Fidelity</div>
              <div
                className={`text-base font-mono font-semibold tabular-nums mt-1 ${
                  tx.decision.fidelityStatus === 'FAILED'
                    ? 'text-red-700 dark:text-red-400'
                    : tx.decision.fidelityStatus === 'DRIFT'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {tx.decision.mandateFidelity}/100 ({tx.decision.fidelityStatus})
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Action alignment
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">4. Behavior Drift</div>
              <div className="text-base font-mono font-semibold text-amber-700 dark:text-amber-300 tabular-nums mt-1">
                {tx.decision.behaviorDrift}/100
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Risk: <RiskText risk={tx.decision.transactionRisk} />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">5. Exposure &amp; E[Cost]</div>
              <div className="text-base font-mono font-semibold text-slate-950 dark:text-slate-100 tabular-nums mt-1">
                {formatInr(tx.decision.expectedFraudLossInr)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                vs {formatInr(tx.decision.falsePositiveFrictionInr)} friction
              </div>
            </div>
          </div>

          {/* Analyst Controls */}
          <div className="pt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <input
              value={analystNote}
              onChange={(e) => setAnalystNote(e.target.value)}
              placeholder="Optional analyst rationale before decision override or opening fraud case..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#050914] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
            />
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  analystOverrideTransaction(
                    tx.id,
                    'ALLOW',
                    analystNote || 'Released after analyst verification',
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                ALLOW
              </button>
              <button
                type="button"
                onClick={() =>
                  analystOverrideTransaction(
                    tx.id,
                    'STEP-UP',
                    analystNote || 'Dispatched STEP-UP verification to Principal',
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors whitespace-nowrap"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                STEP-UP
              </button>
              <button
                type="button"
                onClick={() =>
                  analystOverrideTransaction(
                    tx.id,
                    'HOLD',
                    analystNote || 'Frozen in analyst review queue',
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors whitespace-nowrap"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                HOLD
              </button>
              <button
                type="button"
                onClick={() =>
                  analystOverrideTransaction(
                    tx.id,
                    'BLOCK',
                    analystNote || 'Blocked due to mandate authority violation',
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap"
              >
                <ShieldX className="w-3.5 h-3.5" />
                BLOCK
              </button>
              {!existingCase && (
                <button
                  type="button"
                  onClick={handleOpenCase}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Open Fraud Case
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MANDATE DIFF — Hero Feature */}
        {mandate && (
          <MandateDiff mandate={mandate} transaction={tx} agent={agent} />
        )}

        {/* 3D MANDATE SPACE Synced to Transaction */}
        <section className="space-y-2.5">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
            Spatial Decision State — Mandate Space
          </h2>
          <MandateSpace
            decision={tx.decision.decision}
            hasViolation={!tx.decision.authorityPass}
            amountInr={tx.amountInr}
            agentName={agent?.name || tx.agentId}
            principalName={principal?.name || 'Principal'}
            registeredAccount={`••••${tx.registeredExpectedLast4}`}
            requestedAccount={tx.destinationAccount}
            payee={tx.payee}
            heightClass="h-[380px]"
          />
        </section>

        {/* Ranked Reason Codes + Expandable Evidence Chain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-4">
              Ranked Reason Codes
            </h2>
            <ol className="space-y-4">
              {tx.decision.reasonCodes.map((rc) => (
                <li
                  key={rc.code}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1A]"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-mono text-cyan-700 dark:text-cyan-400 font-medium">
                      0{rc.rank} — {rc.code}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {rc.dimension}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-950 dark:text-slate-100">
                    {rc.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {rc.detail}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-6 shadow-xs dark:shadow-none">
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100 mb-4">
              Cryptographic &amp; Behavioral Evidence Chain
            </h2>
            <div className="space-y-3">
              {tx.evidence.map((ev) => {
                const isOpen = expandedEvidenceId === ev.id;
                return (
                  <div
                    key={ev.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1A] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedEvidenceId(isOpen ? null : ev.id)
                      }
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono text-cyan-700 dark:text-cyan-300 font-medium">
                            {ev.type}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.timestamp}</span>
                        </div>
                        <div className="text-sm text-slate-950 dark:text-slate-100 truncate mt-0.5">
                          {ev.summary}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                        <div className="text-slate-600 dark:text-slate-400 mb-2">
                          Source:{' '}
                          <span className="text-slate-900 dark:text-slate-200">
                            {ev.source}
                          </span>{' '}
                          · Hash:{' '}
                          <span className="font-mono text-slate-800 dark:text-slate-300">
                            {ev.hash}
                          </span>
                        </div>
                        <pre className="p-3 rounded bg-white dark:bg-[#050914] border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">
                          {JSON.stringify(ev.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
