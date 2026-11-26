import { CheckCircle2, PauseCircle, ShieldAlert, ShieldX } from 'lucide-react';
import type { DecisionState, RiskLevel } from '../types/domain';

export function DecisionIndicator({
  decision,
  size = 'md',
}: {
  decision: DecisionState;
  size?: 'sm' | 'md' | 'lg';
}) {
  const styles: Record<
    DecisionState,
    { border: string; bg: string; text: string; Icon: typeof CheckCircle2 }
  > = {
    ALLOW: {
      border: 'border-emerald-300 dark:border-emerald-500/30',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      Icon: CheckCircle2,
    },
    'STEP-UP': {
      border: 'border-cyan-300 dark:border-cyan-500/40',
      bg: 'bg-cyan-50 dark:bg-cyan-500/10',
      text: 'text-cyan-700 dark:text-cyan-300',
      Icon: ShieldAlert,
    },
    HOLD: {
      border: 'border-amber-300 dark:border-amber-500/40',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-300',
      Icon: PauseCircle,
    },
    BLOCK: {
      border: 'border-red-300 dark:border-red-500/40',
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-300',
      Icon: ShieldX,
    },
  };

  const cfg = styles[decision];
  const Icon = cfg.Icon;

  const sizing =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1.5'
      : size === 'lg'
        ? 'px-3.5 py-1.5 text-sm gap-2'
        : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border ${cfg.border} ${cfg.bg} ${cfg.text} ${sizing} whitespace-nowrap shrink-0`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {decision}
    </span>
  );
}

export function RiskText({ risk }: { risk: RiskLevel }) {
  const color =
    risk === 'CRITICAL'
      ? 'text-red-700 dark:text-red-400'
      : risk === 'HIGH'
        ? 'text-amber-700 dark:text-amber-400'
        : risk === 'MEDIUM'
          ? 'text-cyan-700 dark:text-cyan-300'
          : 'text-emerald-700 dark:text-emerald-400';

  return <span className={`font-mono text-xs font-medium ${color}`}>{risk}</span>;
}
