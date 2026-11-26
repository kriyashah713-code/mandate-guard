export function BehavioralDriftViz({
  driftActive = true,
}: {
  driftActive?: boolean;
}) {
  const baselinePoints = [
    { x: 24, y: 74, label: 'Tx #34', time: '09:21' },
    { x: 70, y: 74, label: 'Tx #35', time: '' },
    { x: 116, y: 74, label: 'Tx #36', time: '09:25' },
    { x: 162, y: 74, label: 'Tx #37', time: '' },
    { x: 208, y: 74, label: 'Tx #38', time: '09:29' },
  ];

  const driftPoints = driftActive
    ? [
        { x: 256, y: 58, label: 'Meta', time: '', tone: 'warn' as const },
        { x: 306, y: 40, label: 'Route', time: '', tone: 'warn' as const },
        { x: 358, y: 20, label: 'Tx #41', time: '09:32', tone: 'critical' as const },
      ]
    : [
        { x: 256, y: 74, label: 'Tx #39', time: '', tone: 'pass' as const },
        { x: 306, y: 74, label: 'Tx #40', time: '', tone: 'pass' as const },
        { x: 358, y: 74, label: 'Tx #41', time: '09:32', tone: 'pass' as const },
      ];

  const allPoints = [
    ...baselinePoints.map((p) => ({ ...p, tone: 'pass' as const })),
    ...driftPoints,
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-5 shadow-xs dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
            BEHAVIORAL DRIFT
          </div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100 mt-0.5">
            Routine Settlement Baseline vs Mid-Session Deviation
          </h3>
        </div>
        <span
          className={`text-xs font-mono font-semibold ${
            driftActive
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {driftActive ? 'DRIFT DETECTED · 78/100' : 'NORMAL BASELINE · 04/100'}
        </span>
      </div>

      <svg
        viewBox="0 0 390 112"
        className="w-full h-32 overflow-visible"
        role="img"
        aria-label="Behavioral drift dot trajectory showing normal aligned dots followed by deviation at 09:32"
      >
        {/* Mandate corridor */}
        <rect
          x="10"
          y="61"
          width="370"
          height="26"
          rx="4"
          className="fill-cyan-500/8 dark:fill-cyan-400/8 stroke-cyan-600/25 dark:stroke-cyan-400/25"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        {/* Normal vs Drift connector */}
        <polyline
          fill="none"
          strokeWidth="1.5"
          className="stroke-slate-300 dark:stroke-slate-700"
          points={allPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        />

        {/* Drift callout */}
        {driftActive && (
          <text
            x="275"
            y="11"
            className="fill-red-600 dark:fill-red-400 text-[9px] font-mono font-semibold"
          >
            DEVIATION → ••••9087
          </text>
        )}

        {/* Nodes + subtle timeline ticks */}
        {allPoints.map((pt) => {
          const fillClass =
            pt.tone === 'critical'
              ? 'fill-red-600 dark:fill-red-400'
              : pt.tone === 'warn'
                ? 'fill-amber-600 dark:fill-amber-400'
                : 'fill-cyan-600 dark:fill-cyan-400';

          return (
            <g key={pt.label}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={pt.tone === 'critical' ? 5.5 : 4.2}
                className={fillClass}
              />
              {pt.time && (
                <text
                  x={pt.x}
                  y="104"
                  textAnchor="middle"
                  className={`text-[9px] font-mono ${
                    pt.tone === 'critical'
                      ? 'fill-red-700 dark:fill-red-400 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {pt.time}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
