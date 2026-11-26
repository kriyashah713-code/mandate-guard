import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEMO_USERS,
  INITIAL_AGENTS,
  INITIAL_CASES,
  INITIAL_MANDATES,
  INITIAL_PRINCIPALS,
  INITIAL_SECURITY_LOGS,
  INITIAL_SESSIONS,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';
import { evaluateAction } from '../engine/decisionEngine';
import { SIMULATION_SCENARIOS } from '../simulations/scenarios';
import type {
  Agent,
  AgentSession,
  AuthUser,
  DecisionState,
  FraudCase,
  Mandate,
  Principal,
  SecurityActivityLog,
  Transaction,
  UserRole,
} from '../types/domain';
import { formatCompactInr } from '../utils/format';

interface CreateMandatePayload {
  title: string;
  agentId: string;
  purpose: string;
  maxAmountInr: number;
  dailyLimitInr: number;
  frequencyLimit: string;
  allowedPayees: string[];
  allowedAccounts: string[];
  subAgentDelegationAllowed: boolean;
}

interface AppStateContextValue {
  user: AuthUser | null;
  loginAsRole: (role: UserRole, customEmail?: string) => AuthUser;
  logout: () => void;
  principals: Principal[];
  agents: Agent[];
  mandates: Mandate[];
  sessions: AgentSession[];
  transactions: Transaction[];
  cases: FraudCase[];
  securityLogs: SecurityActivityLog[];
  activeSceneTxId: string;
  setActiveSceneTxId: (id: string) => void;
  createMandate: (payload: CreateMandatePayload) => Mandate;
  updateMandateStatus: (mandateId: string, status: Mandate['status']) => void;
  updateMandateLimit: (mandateId: string, maxAmountInr: number) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  respondToStepUp: (txId: string, action: 'APPROVE' | 'REJECT') => void;
  analystOverrideTransaction: (
    txId: string,
    decision: DecisionState,
    note?: string,
  ) => void;
  openFraudCaseForTransaction: (txId: string, notes?: string) => FraudCase;
  updateFraudCase: (
    caseId: string,
    patch: Partial<Pick<FraudCase, 'status' | 'analystNotes'>>,
  ) => void;
  runSimulationScenario: (scenarioId: string) => Transaction;
  resetFlagshipDemo: () => void;
  totalLossPreventedInr: number;
}

const AUTH_STORAGE_KEY = 'mandate_guard_auth_user_v1';

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      !parsed ||
      (parsed.role !== 'CUSTOMER' && parsed.role !== 'ANALYST') ||
      typeof parsed.email !== 'string' ||
      !parsed.email.trim()
    ) {
      return null;
    }
    const base = DEMO_USERS[parsed.role];
    return {
      ...base,
      email: parsed.email.trim(),
    };
  } catch {
    return null;
  }
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return parseStoredUser(localStorage.getItem(AUTH_STORAGE_KEY));
    } catch {
      return null;
    }
  });

  const [principals] = useState<Principal[]>(INITIAL_PRINCIPALS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [mandates, setMandates] = useState<Mandate[]>(INITIAL_MANDATES);
  const [sessions, setSessions] = useState<AgentSession[]>(INITIAL_SESSIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cases, setCases] = useState<FraudCase[]>(INITIAL_CASES);
  const [securityLogs, setSecurityLogs] = useState<SecurityActivityLog[]>(INITIAL_SECURITY_LOGS);
  const [activeSceneTxId, setActiveSceneTxId] = useState<string>('TX-2026-0041');

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [user]);

  const loginAsRole = (role: UserRole, customEmail?: string): AuthUser => {
    const base = DEMO_USERS[role];
    const nextUser: AuthUser = customEmail?.trim()
      ? { ...base, email: customEmail.trim() }
      : base;
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    setUser(null);
  };

  const createMandate = (payload: CreateMandatePayload): Mandate => {
    if (user?.role !== 'CUSTOMER') {
      throw new Error('Customer authorization required to create mandates.');
    }
    const principalId = user.principalId || 'prin-mehta-01';
    const newMandate: Mandate = {
      id: `MND-${Math.floor(1000 + Math.random() * 8999)}`,
      title: payload.title,
      principalId,
      agentId: payload.agentId,
      purpose: payload.purpose,
      maxAmountInr: payload.maxAmountInr,
      dailyLimitInr: payload.dailyLimitInr,
      frequencyLimit: payload.frequencyLimit,
      allowedPayees: payload.allowedPayees,
      allowedAccounts: payload.allowedAccounts,
      allowedChannels: ['ERP_API_V2', 'CORPORATE_NETBANKING'],
      validFrom: '2026-11-25',
      validUntil: '2027-11-25',
      status: 'ACTIVE',
      subAgentDelegationAllowed: payload.subAgentDelegationAllowed,
      actionsExecuted: 0,
      violationsDetected: 0,
    };
    setMandates((prev) => [newMandate, ...prev]);
    setSecurityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        principalId,
        timestamp: 'Just now',
        actor: user.name,
        event: `Mandate ${newMandate.id} Created`,
        detail: `Delegated ${formatCompactInr(newMandate.maxAmountInr)} cap for ${newMandate.allowedPayees.join(', ')}.`,
        severity: 'INFO',
      },
      ...prev,
    ]);
    return newMandate;
  };

  const updateMandateStatus = (mandateId: string, status: Mandate['status']) => {
    if (user?.role !== 'CUSTOMER') return;
    const target = mandates.find((m) => m.id === mandateId);
    if (!target || target.principalId !== user.principalId) return;

    setMandates((prev) =>
      prev.map((m) => (m.id === mandateId ? { ...m, status } : m)),
    );
    setSecurityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        principalId: user.principalId,
        timestamp: 'Just now',
        actor: user.name,
        event: `Mandate ${mandateId} ${status}`,
        detail: `Status updated to ${status} by customer authority control.`,
        severity: status === 'REVOKED' ? 'CRITICAL' : 'WARNING',
      },
      ...prev,
    ]);
  };

  const updateMandateLimit = (mandateId: string, maxAmountInr: number) => {
    if (user?.role !== 'CUSTOMER') return;
    const target = mandates.find((m) => m.id === mandateId);
    if (!target || target.principalId !== user.principalId) return;

    setMandates((prev) =>
      prev.map((m) => (m.id === mandateId ? { ...m, maxAmountInr } : m)),
    );
    setSecurityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        principalId: user.principalId,
        timestamp: 'Just now',
        actor: user.name,
        event: `Mandate ${mandateId} Ceiling Modified`,
        detail: `Per-action ceiling adjusted to ${formatCompactInr(maxAmountInr)}.`,
        severity: 'INFO',
      },
      ...prev,
    ]);
  };

  const updateAgentStatus = (agentId: string, status: Agent['status']) => {
    if (user?.role !== 'CUSTOMER') return;
    const target = agents.find((a) => a.id === agentId);
    if (!target || target.principalId !== user.principalId) return;

    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status } : a)),
    );
    setSecurityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        principalId: user.principalId,
        timestamp: 'Just now',
        actor: user.name,
        event: `Agent ${agentId} ${status}`,
        detail: `Agent execution authority updated to ${status} by Principal.`,
        severity: status === 'SUSPENDED' ? 'CRITICAL' : 'WARNING',
      },
      ...prev,
    ]);
  };

  const createFraudCaseRecord = (txId: string, notes?: string): FraudCase => {
    const existing = cases.find((c) => c.transactionId === txId);
    if (existing) return existing;

    const tx = transactions.find((t) => t.id === txId) || transactions[0];
    const session = sessions.find((s) => s.id === tx.sessionId);

    const newCase: FraudCase = {
      id: `CASE-2026-${Math.floor(200 + Math.random() * 799)}`,
      openedAt: 'Just now',
      transactionId: tx.id,
      agentId: tx.agentId,
      principalId: tx.principalId,
      mandateId: tx.mandateId,
      decision: 'BLOCK',
      status: 'RESOLVED_PREVENTED',
      financialExposureInr: tx.amountInr,
      lossPreventedInr: tx.amountInr,
      reasonCodes: tx.decision.reasonCodes,
      timeline: session?.timeline || [],
      evidence: tx.evidence,
      analystNotes:
        notes ||
        `Prevented ${formatCompactInr(tx.amountInr)} loss on ${tx.payee}. Destination account ${tx.destinationAccount} violated delegated mandate.`,
      assignedAnalyst: user?.role === 'ANALYST' ? user.name : 'Priya Nair',
    };

    setCases((prev) => [newCase, ...prev]);
    return newCase;
  };

  const openFraudCaseForTransaction = (txId: string, notes?: string): FraudCase => {
    if (user?.role !== 'ANALYST') {
      throw new Error('Analyst authorization required to open fraud cases.');
    }
    return createFraudCaseRecord(txId, notes);
  };

  const respondToStepUp = (txId: string, action: 'APPROVE' | 'REJECT') => {
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;
    const isAuthorizedCustomer =
      user?.role === 'CUSTOMER' && target.principalId === user.principalId;
    const isPublicFlagshipDemo = !user && txId === 'TX-2026-0041';
    if (!isAuthorizedCustomer && !isPublicFlagshipDemo) return;

    if (action === 'REJECT') {
      // STEP-UP -> CUSTOMER REJECTS ("NOT ME") -> BLOCK -> FRAUD CASE -> LOSS PREVENTED
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id !== txId) return tx;
          return {
            ...tx,
            customerApprovalStatus: 'REJECTED',
            analystReviewStatus: 'CLOSED_BLOCKED',
            decision: {
              ...tx.decision,
              decision: 'BLOCK',
              transactionRisk: 'CRITICAL',
              nextAction: `BLOCKED by Principal ("NOT ME") · ${formatCompactInr(tx.amountInr)} loss prevented`,
            },
            evidence: [
              ...tx.evidence,
              {
                id: `ev-cust-${Date.now()}`,
                timestamp: 'Just now',
                source: 'Principal Step-Up Confirmation',
                type: 'CUSTOMER_ACTION',
                summary: `Principal Arvind Mehta selected "NOT ME" — confirmed unauthorized account ${tx.destinationAccount}`,
                payload: {
                  customerChoice: 'NOT_ME_REJECT',
                  resultingDecision: 'BLOCK',
                  lossPreventedInr: tx.amountInr,
                },
                hash: '0xf401...882d',
              },
            ],
          };
        }),
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === target.sessionId
            ? {
                ...s,
                decisionState: 'BLOCK',
                currentRisk: 'CRITICAL',
                timeline: [
                  ...s.timeline,
                  {
                    time: '09:35',
                    label: 'Customer rejected ("NOT ME")',
                    detail: `Principal denied payment to ${target.destinationAccount}`,
                    severity: 'CRITICAL',
                  },
                  {
                    time: '09:35',
                    label: 'BLOCK · Loss prevented',
                    detail: `${formatCompactInr(target.amountInr)} blocked and fraud case opened`,
                    severity: 'DECISION',
                  },
                ],
              }
            : s,
        ),
      );

      createFraudCaseRecord(
        txId,
        `Principal Arvind Mehta rejected STEP-UP confirmation ("NOT ME") for ${target.destinationAccount}. Registered supplier account is ••••${target.registeredExpectedLast4}. ${formatCompactInr(target.amountInr)} loss prevented.`,
      );

      setSecurityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          principalId: target.principalId,
          timestamp: 'Just now',
          actor: 'Arvind Mehta (Principal)',
          event: `Transaction ${txId} Blocked ("NOT ME")`,
          detail: `Rejected ${formatCompactInr(target.amountInr)} payout to ${target.destinationAccount}. Fraud case opened.`,
          severity: 'CRITICAL',
        },
        ...prev,
      ]);
      setActiveSceneTxId(txId);
    } else {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id !== txId) return tx;
          return {
            ...tx,
            customerApprovalStatus: 'APPROVED',
            analystReviewStatus: 'CLOSED_RELEASED',
            decision: {
              ...tx.decision,
              decision: 'ALLOW',
              transactionRisk: 'LOW',
              nextAction: 'Released after explicit out-of-band Principal authorization',
            },
            evidence: [
              ...tx.evidence,
              {
                id: `ev-cust-${Date.now()}`,
                timestamp: 'Just now',
                source: 'Principal Step-Up Confirmation',
                type: 'CUSTOMER_ACTION',
                summary: 'Principal explicitly approved out-of-mandate exception',
                payload: { customerChoice: 'APPROVE_EXCEPTION', resultingDecision: 'ALLOW' },
                hash: '0xa219...44c1',
              },
            ],
          };
        }),
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === target.sessionId
            ? { ...s, decisionState: 'ALLOW', currentRisk: 'LOW' }
            : s,
        ),
      );
      setActiveSceneTxId(txId);
    }
  };

  const analystOverrideTransaction = (
    txId: string,
    decision: DecisionState,
    note?: string,
  ) => {
    if (user?.role !== 'ANALYST') return;
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== txId) return tx;
        return {
          ...tx,
          analystReviewStatus:
            decision === 'BLOCK'
              ? 'CLOSED_BLOCKED'
              : decision === 'ALLOW'
                ? 'CLOSED_RELEASED'
                : 'ESCALATED',
          customerApprovalStatus:
            decision === 'STEP-UP' ? 'PENDING' : tx.customerApprovalStatus,
          decision: {
            ...tx.decision,
            decision,
            transactionRisk:
              decision === 'BLOCK'
                ? 'CRITICAL'
                : decision === 'ALLOW'
                  ? 'LOW'
                  : 'HIGH',
            nextAction:
              decision === 'BLOCK'
                ? `Blocked by Analyst ${user?.name || 'Priya Nair'} · ${formatCompactInr(tx.amountInr)} protected`
                : decision === 'STEP-UP'
                  ? 'Customer STEP-UP verification dispatched to Principal'
                  : decision === 'HOLD'
                    ? 'Frozen in Risk Operations review queue'
                    : 'Released by Risk Analyst',
          },
          evidence: [
            ...tx.evidence,
            {
              id: `ev-anl-${Date.now()}`,
              timestamp: 'Just now',
              source: `Risk Analyst (${user?.name || 'Priya Nair'})`,
              type: 'ANALYST_ACTION',
              summary: `Analyst set decision to ${decision}${note ? `: ${note}` : ''}`,
              payload: { analystDecision: decision },
              hash: '0x6b20...10ef',
            },
          ],
        };
      }),
    );

    setSessions((prev) =>
      prev.map((s) =>
        s.id === target.sessionId
          ? {
              ...s,
              decisionState: decision,
              timeline: [
                ...s.timeline,
                {
                  time: 'Now',
                  label: `Analyst -> ${decision}`,
                  detail: note || `Risk Analyst updated session state to ${decision}`,
                  severity: 'DECISION',
                },
              ],
            }
          : s,
      ),
    );

    if (decision === 'BLOCK') {
      createFraudCaseRecord(txId, note);
    }
    setActiveSceneTxId(txId);
  };

  const updateFraudCase = (
    caseId: string,
    patch: Partial<Pick<FraudCase, 'status' | 'analystNotes'>>,
  ) => {
    if (user?.role !== 'ANALYST') return;
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, ...patch } : c)),
    );
  };

  const runSimulationScenario = (scenarioId: string): Transaction => {
    if (user?.role !== 'ANALYST') {
      throw new Error('Analyst authorization required to run simulations.');
    }
    const scenario =
      SIMULATION_SCENARIOS.find((s) => s.id === scenarioId) ||
      SIMULATION_SCENARIOS[4];
    const agent =
      agents.find((a) => a.id === scenario.agentId) || agents[0];
    const mandate =
      mandates.find((m) => m.id === scenario.mandateId) || mandates[0];

    const simulatedAgent: Agent = {
      ...agent,
      trustScore: scenario.input.agentTrust,
    };

    const decision = evaluateAction({
      agent: simulatedAgent,
      mandate,
      amountInr: scenario.input.amountInr,
      payee: scenario.input.payee,
      destinationLast4: scenario.input.destinationLast4,
      purpose: scenario.input.purpose,
      channel: scenario.input.channel,
      behaviorAnomalyScore: scenario.input.behaviorAnomalyScore,
      externalInstructionDetected: scenario.input.externalInstructionDetected,
      externalInstructionNote: scenario.input.externalInstructionNote,
      subAgentRequested: scenario.input.subAgentRequested,
      subAgentName: scenario.input.subAgentName,
      humanCadenceAnomaly: scenario.input.humanCadenceAnomaly,
      scriptedVelocityAnomaly: scenario.input.scriptedVelocityAnomaly,
    });

    const seq = transactions.length + 37;
    const txId = `TX-SIM-${String(seq).padStart(4, '0')}`;
    const sessionId = `SES-SIM-${Math.floor(1000 + Math.random() * 8999)}`;
    const expectedLast4 = mandate.allowedAccounts[0] || '4412';

    const newSession: AgentSession = {
      id: sessionId,
      agentId: agent.id,
      principalId: mandate.principalId,
      mandateId: mandate.id,
      startedAt: 'Just now',
      durationLabel: '00m 12s',
      deviceClient: `${agent.provenance.issuer} (Simulated)`,
      ipRegion: 'Mumbai AP-South',
      currentTrust: simulatedAgent.trustScore,
      currentFidelity: decision.mandateFidelity,
      currentRisk: decision.transactionRisk,
      decisionState: decision.decision,
      behavioralSignals: decision.reasonCodes.map((r) => r.title),
      timeline: [
        {
          time: 'T+00s',
          label: 'Session started',
          detail: `${agent.name} authenticated (${agent.type})`,
          severity: 'NORMAL',
        },
        {
          time: 'T+04s',
          label: `${formatCompactInr(scenario.input.amountInr)} requested`,
          detail: `Payee: ${scenario.input.payee} · Dest ••••${scenario.input.destinationLast4}`,
          severity: decision.authorityPass ? 'NORMAL' : 'WARNING',
        },
        {
          time: `T+${decision.evaluationLatencyMs}ms`,
          label: `Decision: ${decision.decision}`,
          detail: decision.reasonCodes[0]?.title || 'Evaluated by KYA Engine',
          severity: decision.decision === 'ALLOW' ? 'NORMAL' : 'CRITICAL',
        },
      ],
    };

    const customerPlainExplanation =
      decision.decision === 'ALLOW'
        ? `${agent.name} executed ${formatCompactInr(scenario.input.amountInr)} to registered ${scenario.input.payee} (••••${scenario.input.destinationLast4}) within mandate.`
        : `Your agent attempted ${formatCompactInr(scenario.input.amountInr)} to ${scenario.input.payee} (••••${scenario.input.destinationLast4}). ${decision.reasonCodes[0]?.detail || ''}`;

    const newTx: Transaction = {
      id: txId,
      sequenceNumber: seq,
      timestamp: 'Just now (Simulation)',
      sessionId,
      agentId: agent.id,
      principalId: mandate.principalId,
      mandateId: mandate.id,
      amountInr: scenario.input.amountInr,
      payee: scenario.input.payee,
      destinationAccount: `••••${scenario.input.destinationLast4}`,
      destinationAccountLast4: scenario.input.destinationLast4,
      registeredExpectedLast4: expectedLast4,
      purpose: `${scenario.title} — ${scenario.input.purpose}`,
      channel: scenario.input.channel,
      externalInstructionDetected: scenario.input.externalInstructionDetected,
      externalInstructionNote: scenario.input.externalInstructionNote,
      subAgentRequested: scenario.input.subAgentRequested,
      subAgentName: scenario.input.subAgentName,
      customerPlainExplanation,
      customerApprovalStatus:
        decision.decision === 'HOLD' || decision.decision === 'STEP-UP'
          ? 'PENDING'
          : undefined,
      analystReviewStatus:
        decision.decision === 'ALLOW'
          ? 'AUTO_CLEARED'
          : decision.decision === 'BLOCK'
            ? 'CLOSED_BLOCKED'
            : 'ESCALATED',
      decision,
      evidence: [
        {
          id: `ev-sim-${Date.now()}`,
          timestamp: 'Just now',
          source: 'Simulation Lab Engine',
          type: 'MANDATE_SNAPSHOT',
          summary: `Scenario #${scenario.number}: ${scenario.title} evaluated in ${decision.evaluationLatencyMs}ms`,
          payload: {
            trust: simulatedAgent.trustScore,
            fidelity: decision.mandateFidelity,
            authorityPass: decision.authorityPass,
            decision: decision.decision,
          },
          hash: `0x${Math.random().toString(16).slice(2, 10)}`,
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    setActiveSceneTxId(txId);

    if (decision.decision === 'BLOCK') {
      const autoCase: FraudCase = {
        id: `CASE-SIM-${Math.floor(300 + Math.random() * 699)}`,
        openedAt: 'Just now',
        transactionId: txId,
        agentId: agent.id,
        principalId: mandate.principalId,
        mandateId: mandate.id,
        decision: 'BLOCK',
        status: 'RESOLVED_PREVENTED',
        financialExposureInr: scenario.input.amountInr,
        lossPreventedInr: scenario.input.amountInr,
        reasonCodes: decision.reasonCodes,
        timeline: newSession.timeline,
        evidence: newTx.evidence,
        analystNotes: `Auto-generated from Simulation Scenario #${scenario.number}: ${scenario.title}.`,
        assignedAnalyst: user?.role === 'ANALYST' ? user.name : 'Priya Nair',
      };
      setCases((prev) => [autoCase, ...prev]);
    }

    return newTx;
  };

  const resetFlagshipDemo = () => {
    setAgents(INITIAL_AGENTS);
    setMandates(INITIAL_MANDATES);
    setSessions(INITIAL_SESSIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCases(INITIAL_CASES);
    setSecurityLogs(INITIAL_SECURITY_LOGS);
    setActiveSceneTxId('TX-2026-0041');
  };

  const totalLossPreventedInr = useMemo(
    () => cases.reduce((sum, c) => sum + c.lossPreventedInr, 0),
    [cases],
  );

  return (
    <AppStateContext.Provider
      value={{
        user,
        loginAsRole,
        logout,
        principals,
        agents,
        mandates,
        sessions,
        transactions,
        cases,
        securityLogs,
        activeSceneTxId,
        setActiveSceneTxId,
        createMandate,
        updateMandateStatus,
        updateMandateLimit,
        updateAgentStatus,
        respondToStepUp,
        analystOverrideTransaction,
        openFraudCaseForTransaction,
        updateFraudCase,
        runSimulationScenario,
        resetFlagshipDemo,
        totalLossPreventedInr,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
