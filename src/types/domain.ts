export type UserRole = 'CUSTOMER' | 'ANALYST';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  title: string;
  principalId?: string;
}

export type AgentType =
  | 'HUMAN'
  | 'SCRIPTED_BOT'
  | 'LLM_AGENT'
  | 'HUMAN_MIMICKING_AGENT';

export type DecisionState = 'ALLOW' | 'STEP-UP' | 'HOLD' | 'BLOCK';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FidelityStatus = 'VERIFIED' | 'DRIFT' | 'FAILED';

export interface Principal {
  id: string;
  name: string;
  businessName: string;
  accountNumber: string;
  kycTier: 'CORPORATE_VERIFIED' | 'RETAIL_PRIME';
  city: string;
  typicalHours: string;
  historicalAvgTicketInr: number;
  registeredChannels: string[];
}

export interface Agent {
  id: string;
  name: string;
  handle: string;
  type: AgentType;
  principalId: string;
  provenance: {
    issuer: string;
    sdkVersion: string;
    certificateFingerprint: string;
    attestedAt: string;
    deploymentEnv: string;
  };
  trustScore: number; // 0-100: identity & historical reliability of agent itself
  historicalActionsCount: number;
  verifiedActionsCount: number;
  violationCount: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
  baselinePattern: string;
  riskSignals: RiskSignal[];
}

export interface Mandate {
  id: string;
  title: string;
  principalId: string;
  agentId: string;
  purpose: string;
  maxAmountInr: number;
  dailyLimitInr: number;
  frequencyLimit: string;
  allowedPayees: string[];
  allowedAccounts: string[]; // Masked last 4 e.g. ['4412', '8831']
  allowedChannels: string[];
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED';
  subAgentDelegationAllowed: boolean;
  actionsExecuted: number;
  violationsDetected: number;
}

export interface RiskSignal {
  id: string;
  label: string;
  category: 'AUTHORITY' | 'FIDELITY' | 'BEHAVIOR' | 'PROVENANCE' | 'EXPOSURE';
  severity: RiskLevel;
  description: string;
  detectedAt: string;
}

export interface ReasonCode {
  rank: number;
  code: string;
  title: string;
  detail: string;
  dimension: 'AUTHORITY' | 'FIDELITY' | 'BEHAVIOR' | 'EXPOSURE';
}

export interface EvidenceItem {
  id: string;
  timestamp: string;
  source: string;
  type: 'PROVENANCE' | 'MANDATE_SNAPSHOT' | 'PROMPT_TRACE' | 'TELEMETRY' | 'CUSTOMER_ACTION' | 'ANALYST_ACTION';
  summary: string;
  payload: Record<string, string | number | boolean>;
  hash: string;
}

export interface DecisionBreakdown {
  authorityPass: boolean;
  authorityNote: string;
  agentTrust: number;
  mandateFidelity: number; // 0-100
  fidelityStatus: FidelityStatus;
  behaviorDrift: number; // 0-100 anomaly score
  transactionRisk: RiskLevel;
  exposureInr: number;
  exposureCategory: RiskLevel;
  expectedFraudLossInr: number;
  falsePositiveFrictionInr: number;
  expectedCostDecision: DecisionState;
  hardAuthorityOverrideBlocked: boolean;
  decision: DecisionState;
  nextAction: string;
  reasonCodes: ReasonCode[];
  evaluationLatencyMs: number;
}

export interface SessionTimelineEvent {
  time: string;
  label: string;
  detail: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'DECISION';
}

export interface AgentSession {
  id: string;
  agentId: string;
  principalId: string;
  mandateId: string;
  startedAt: string;
  durationLabel: string;
  deviceClient: string;
  ipRegion: string;
  currentTrust: number;
  currentFidelity: number;
  currentRisk: RiskLevel;
  decisionState: DecisionState;
  behavioralSignals: string[];
  timeline: SessionTimelineEvent[];
}

export interface Transaction {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  sessionId: string;
  agentId: string;
  principalId: string;
  mandateId: string;
  amountInr: number;
  payee: string;
  destinationAccount: string; // e.g. '••••9087'
  destinationAccountLast4: string; // e.g. '9087'
  registeredExpectedLast4: string; // e.g. '4412'
  purpose: string;
  channel: string;
  externalInstructionDetected: boolean;
  externalInstructionNote?: string;
  subAgentRequested?: boolean;
  subAgentName?: string;
  customerPlainExplanation: string;
  customerApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  analystReviewStatus: 'AUTO_CLEARED' | 'NEEDS_REVIEW' | 'ESCALATED' | 'CLOSED_BLOCKED' | 'CLOSED_RELEASED';
  decision: DecisionBreakdown;
  evidence: EvidenceItem[];
}

export interface FraudCase {
  id: string;
  openedAt: string;
  transactionId: string;
  agentId: string;
  principalId: string;
  mandateId: string;
  decision: DecisionState;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED_PREVENTED' | 'DISMISSED';
  financialExposureInr: number;
  lossPreventedInr: number;
  reasonCodes: ReasonCode[];
  timeline: SessionTimelineEvent[];
  evidence: EvidenceItem[];
  analystNotes: string;
  assignedAnalyst: string;
}

export interface SimulationScenario {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  agentType: AgentType;
  expectedOutcome: DecisionState;
  storyTag: string;
  description: string;
  agentId: string;
  mandateId: string;
  input: {
    amountInr: number;
    payee: string;
    destinationLast4: string;
    purpose: string;
    channel: string;
    agentTrust: number;
    behaviorAnomalyScore: number;
    externalInstructionDetected: boolean;
    externalInstructionNote?: string;
    subAgentRequested?: boolean;
    subAgentName?: string;
    humanCadenceAnomaly?: boolean;
    scriptedVelocityAnomaly?: boolean;
  };
}

export interface SecurityActivityLog {
  id: string;
  principalId?: string;
  timestamp: string;
  actor: string;
  event: string;
  detail: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
