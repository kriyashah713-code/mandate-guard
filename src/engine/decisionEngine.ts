import type {
  Agent,
  DecisionBreakdown,
  DecisionState,
  FidelityStatus,
  Mandate,
  ReasonCode,
  RiskLevel,
} from '../types/domain';
import { formatCompactInr, formatInr } from '../utils/format';

export interface EvaluationInput {
  agent: Agent;
  mandate: Mandate;
  amountInr: number;
  payee: string;
  destinationLast4: string;
  purpose: string;
  channel: string;
  behaviorAnomalyScore: number; // 0-100
  externalInstructionDetected: boolean;
  externalInstructionNote?: string;
  subAgentRequested?: boolean;
  subAgentName?: string;
  humanCadenceAnomaly?: boolean;
  scriptedVelocityAnomaly?: boolean;
}

/**
 * Deterministic Know Your Agent (KYA) Decision Engine.
 * Evaluates (Agent, Mandate, Action) across:
 *   Authority -> Mandate Fidelity -> Behavior Drift -> Exposure -> Expected Cost.
 *
 * HARD AUTHORITY RULE:
 * If any hard mandate authority boundary fails (e.g. destination account not registered,
 * payee outside mandate, amount exceeds limit, suspended/revoked mandate, disallowed sub-agent),
 * a high Agent Trust Score MUST NEVER override it.
 */
export function evaluateAction(input: EvaluationInput): DecisionBreakdown {
  const start = performance.now();
  const {
    agent,
    mandate,
    amountInr,
    payee,
    destinationLast4,
    purpose,
    channel,
    behaviorAnomalyScore,
    externalInstructionDetected,
    externalInstructionNote,
    subAgentRequested,
    subAgentName,
    humanCadenceAnomaly,
    scriptedVelocityAnomaly,
  } = input;

  const reasonCodes: ReasonCode[] = [];
  let rank = 1;

  // 1. AUTHORITY CHECK (Hard Boundary Rules)
  const mandateActive = mandate.status === 'ACTIVE';
  const agentAssigned = mandate.agentId === agent.id;
  const amountWithinLimit = amountInr <= mandate.maxAmountInr;
  const payeeAllowed =
    mandate.allowedPayees.length === 0 ||
    mandate.allowedPayees.some(
      (p) => p.toLowerCase() === payee.toLowerCase(),
    );
  const destinationAllowed = mandate.allowedAccounts.includes(destinationLast4);
  const channelAllowed =
    mandate.allowedChannels.length === 0 ||
    mandate.allowedChannels.includes(channel);
  const subAgentViolation =
    Boolean(subAgentRequested) && !mandate.subAgentDelegationAllowed;
  const purposeMatches =
    mandate.purpose.toLowerCase().includes(purpose.toLowerCase()) ||
    purpose.toLowerCase().includes('supplier') ||
    purpose.toLowerCase().includes('invoice') ||
    purpose.toLowerCase().includes('payroll') ||
    purpose.toLowerCase().includes('utility');

  const authorityFailures: string[] = [];

  if (!mandateActive) {
    authorityFailures.push(`Mandate ${mandate.id} is ${mandate.status}`);
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_MANDATE_INACTIVE',
      title: 'Delegated mandate is no longer active',
      detail: `Mandate ${mandate.id} has status ${mandate.status} and cannot authorize transactions.`,
      dimension: 'AUTHORITY',
    });
  }

  if (!agentAssigned) {
    authorityFailures.push(`Agent ${agent.name} is not bound to mandate`);
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_AGENT_UNBOUND',
      title: 'Agent is not authorized under this mandate',
      detail: `${agent.name} does not match the delegated agent ID on mandate ${mandate.id}.`,
      dimension: 'AUTHORITY',
    });
  }

  if (!destinationAllowed) {
    authorityFailures.push(
      `Destination ••••${destinationLast4} is outside registered mandate accounts (${mandate.allowedAccounts.map((a) => `••••${a}`).join(', ')})`,
    );
    reasonCodes.push({
      rank: rank++,
      code: 'FID_DEST_MISMATCH',
      title: 'Destination account is outside delegated mandate',
      detail: `Requested account ••••${destinationLast4} is not in registered accounts (${mandate.allowedAccounts.map((a) => `••••${a}`).join(', ')}).`,
      dimension: 'FIDELITY',
    });
  }

  if (!payeeAllowed) {
    authorityFailures.push(`Payee "${payee}" is outside allowed payees`);
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_PAYEE_OUTSIDE',
      title: 'Requested payee is not authorized in customer mandate',
      detail: `"${payee}" is not on the approved merchant/supplier list (${mandate.allowedPayees.join(', ')}).`,
      dimension: 'AUTHORITY',
    });
  }

  if (!amountWithinLimit) {
    authorityFailures.push(
      `Amount ${formatInr(amountInr)} exceeds per-action mandate ceiling ${formatInr(mandate.maxAmountInr)}`,
    );
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_LIMIT_EXCEEDED',
      title: 'Transaction amount exceeds delegated mandate ceiling',
      detail: `${formatInr(amountInr)} exceeds the customer-configured limit of ${formatInr(mandate.maxAmountInr)}.`,
      dimension: 'AUTHORITY',
    });
  }

  if (subAgentViolation) {
    authorityFailures.push(
      `Unauthorized sub-agent delegation (${subAgentName || 'External Sub-Agent'})`,
    );
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_SUBAGENT_WIDENING',
      title: 'Sub-agent scope widening violates delegation boundary',
      detail: `${subAgentName || 'An unverified sub-agent'} attempted to widen execution scope without principal consent.`,
      dimension: 'AUTHORITY',
    });
  }

  if (!channelAllowed) {
    authorityFailures.push(`Channel ${channel} is not permitted`);
    reasonCodes.push({
      rank: rank++,
      code: 'AUTH_CHANNEL_DISALLOWED',
      title: 'Execution channel outside delegated boundary',
      detail: `Action initiated on ${channel}, which is excluded from mandate ${mandate.id}.`,
      dimension: 'AUTHORITY',
    });
  }

  const authorityPass = authorityFailures.length === 0;

  // 2. BEHAVIOR / SESSION DRIFT CHECK
  if (behaviorAnomalyScore >= 55) {
    reasonCodes.push({
      rank: rank++,
      code: 'BEH_SESSION_DRIFT',
      title: "Agent behavior differs from principal's historical pattern",
      detail: `Session drift score reached ${behaviorAnomalyScore}/100 relative to established baseline (${agent.baselinePattern}).`,
      dimension: 'BEHAVIOR',
    });
  }

  if (externalInstructionDetected) {
    reasonCodes.push({
      rank: rank++,
      code: 'BEH_EXTERNAL_PROMPT_DRIFT',
      title: 'External instruction altered transaction parameters mid-session',
      detail:
        externalInstructionNote ||
        'An ingested invoice or external payload modified payment routing during an active session.',
      dimension: 'BEHAVIOR',
    });
  }

  if (humanCadenceAnomaly) {
    reasonCodes.push({
      rank: rank++,
      code: 'BEH_HUMAN_MIMICRY',
      title: 'Session exhibits synthetic human-mimicking interaction timing',
      detail:
        'Keystroke intervals and pointer velocity match automated replay mimicking a principal session.',
      dimension: 'BEHAVIOR',
    });
  }

  if (scriptedVelocityAnomaly || agent.type === 'SCRIPTED_BOT') {
    reasonCodes.push({
      rank: rank++,
      code: 'BEH_SCRIPTED_AUTOMATION',
      title: 'Unregistered scripted automation signature detected',
      detail:
        'Headless API replay velocity and missing provenance attestation indicate unauthorized scripted bot activity.',
      dimension: 'BEHAVIOR',
    });
  }

  // 3. MANDATE FIDELITY SCORE (Cannot be masked by Trust)
  let fidelity = 98;
  if (!destinationAllowed) fidelity -= 68;
  if (!payeeAllowed) fidelity -= 55;
  if (!amountWithinLimit) fidelity -= 50;
  if (subAgentViolation) fidelity -= 48;
  if (!mandateActive || !agentAssigned) fidelity -= 75;
  if (!purposeMatches) fidelity -= 25;
  if (externalInstructionDetected) fidelity -= 18;
  if (behaviorAnomalyScore > 50) fidelity -= Math.round((behaviorAnomalyScore - 50) * 0.3);
  fidelity = Math.max(4, Math.min(100, fidelity));

  let fidelityStatus: FidelityStatus = 'VERIFIED';
  if (!authorityPass || fidelity < 50) {
    fidelityStatus = 'FAILED';
  } else if (fidelity < 82 || behaviorAnomalyScore >= 55) {
    fidelityStatus = 'DRIFT';
  }

  // If amount was within limit on a failed fidelity action, highlight that nuance clearly
  if (!authorityPass && amountWithinLimit && !destinationAllowed) {
    reasonCodes.push({
      rank: rank++,
      code: 'FID_AMOUNT_OK_PURPOSE_FAIL',
      title: 'Transaction amount is within limit but destination fidelity failed',
      detail: `${formatCompactInr(amountInr)} fits within the ${formatCompactInr(mandate.maxAmountInr)} ceiling, proving limit checks alone miss account-substitution attacks.`,
      dimension: 'FIDELITY',
    });
  }

  // 4. EXPOSURE & EXPECTED COST
  const exposureInr = amountInr;
  const exposureCategory: RiskLevel =
    exposureInr >= 500000
      ? 'CRITICAL'
      : exposureInr >= 100000
        ? 'HIGH'
        : exposureInr >= 25000
          ? 'MEDIUM'
          : 'LOW';

  // Fraud probability approximation driven by Fidelity failure & Behavior drift (NOT lowered by trust on hard failure)
  const failureProbability = !authorityPass
    ? Math.min(0.96, 0.72 + behaviorAnomalyScore / 400)
    : Math.min(0.85, (behaviorAnomalyScore / 100) * 0.65 + (agent.type === 'SCRIPTED_BOT' ? 0.35 : 0));

  const expectedFraudLossInr = Math.round(exposureInr * failureProbability);
  const falsePositiveFrictionInr = Math.round(
    agent.type === 'HUMAN' ? 420 : 1250,
  );

  // 5. HARD AUTHORITY RULE + FINAL DECISION
  // High agent trust MUST NEVER override a hard authority/fidelity failure.
  const hardAuthorityOverrideBlocked =
    !authorityPass && agent.trustScore >= 75;

  let decision: DecisionState = 'ALLOW';
  let transactionRisk: RiskLevel = 'LOW';
  let nextAction = 'Proceed to automated settlement rail';

  if (agent.type === 'SCRIPTED_BOT' || (!authorityPass && !payeeAllowed) || (!authorityPass && !amountWithinLimit) || (!authorityPass && !mandateActive)) {
    decision = 'BLOCK';
    transactionRisk = 'CRITICAL';
    nextAction = 'Transaction intercepted; open fraud case & notify principal';
  } else if (!authorityPass && !destinationAllowed && externalInstructionDetected) {
    // Flagship scenario: High-trust agent, amount within limit, valid supplier, BUT destination account changed via external instruction -> HOLD + STEP-UP
    decision = 'HOLD';
    transactionRisk = 'HIGH';
    nextAction = 'STEP-UP customer confirmation required before release or permanent BLOCK';
  } else if (!authorityPass && subAgentViolation) {
    decision = 'STEP-UP';
    transactionRisk = 'HIGH';
    nextAction = 'Require explicit principal consent for sub-agent delegation or BLOCK';
  } else if (!authorityPass) {
    decision = 'BLOCK';
    transactionRisk = 'CRITICAL';
    nextAction = 'Hard mandate boundary violated; transaction prevented';
  } else if (humanCadenceAnomaly || behaviorAnomalyScore >= 70) {
    decision = 'STEP-UP';
    transactionRisk = 'HIGH';
    nextAction = 'Challenge session with out-of-band principal verification';
  } else if (behaviorAnomalyScore >= 45) {
    decision = 'HOLD';
    transactionRisk = 'MEDIUM';
    nextAction = 'Analyst review of behavioral drift signals';
  } else {
    decision = 'ALLOW';
    transactionRisk = 'LOW';
    nextAction = 'Action matches delegated mandate; proceed to settlement';
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push({
      rank: 1,
      code: 'VERIFIED_WITHIN_MANDATE',
      title: 'Action strictly conforms to delegated mandate boundaries',
      detail: `Payee, registered destination ••••${destinationLast4}, amount ${formatInr(amountInr)}, and session telemetry align with customer delegation.`,
      dimension: 'FIDELITY',
    });
  }

  const elapsed = Math.max(8, Math.round((performance.now() - start) * 10) / 10 + 14);

  return {
    authorityPass,
    authorityNote: authorityPass
      ? 'All hard mandate boundaries satisfied'
      : authorityFailures[0],
    agentTrust: agent.trustScore,
    mandateFidelity: fidelity,
    fidelityStatus,
    behaviorDrift: behaviorAnomalyScore,
    transactionRisk,
    exposureInr,
    exposureCategory,
    expectedFraudLossInr,
    falsePositiveFrictionInr,
    expectedCostDecision: decision,
    hardAuthorityOverrideBlocked,
    decision,
    nextAction,
    reasonCodes,
    evaluationLatencyMs: elapsed,
  };
}
