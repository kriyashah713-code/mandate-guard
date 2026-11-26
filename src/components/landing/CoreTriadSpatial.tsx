import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Play } from 'lucide-react';
import { SETTLE_EASE } from '../../animations/scrollSystem';

const JOURNEY_NODES = [
  {
    id: 'CUSTOMER',
    label: 'Customer',
    time: '09:31:12',
    status: 'Mandate MND-8841 active',
    risk: 'Authority verified',
  },
  {
    id: 'AGENT',
    label: 'AI Agent',
    time: '09:31:48',
    status: 'Invoice parsed · ₹85,000',
    risk: 'mTLS identity verified',
  },
  {
    id: 'BANK',
    label: 'Bank / Risk Engine',
    time: '09:31:59',
    status: 'Mandate boundary cleared',
    risk: 'Fidelity 100 / 100',
  },
  {
    id: 'PAYEE',
    label: 'Payee',
    time: '09:32:01',
    status: 'ABC Industries · ••••4412',
    risk: 'ALLOW · Settled',
  },
];

export function CoreTriadSpatial() {
  const reduced = useReducedMotion();
  const [activeHop, setActiveHop] = useState(3);

  const triadNodes = [
    {
      role: '01. Agent',
      title: 'Supplier Payment Agent',
      meta: 'Identity Verified · Trust 92/100',
      note: 'Tells the bank who is requesting the payment.',
      offset: 'lg:translate-y-4',
    },
    {
      role: '02. Mandate',
      title: 'Authority Boundary (MND-8841)',
      meta: 'Max ₹2,00,000 · Registered Acct ••••4412',
      note: 'Tells the bank what the customer actually permitted.',
      offset: 'lg:-translate-y-4',
    },
    {
      role: '03. Action',
      title: 'Live Payment Request',
      meta: '₹1,40,000 · ABC Industries · Dest ••••9087',
      note: 'Tests whether this exact transfer stays inside the envelope.',
      offset: 'lg:translate-y-4',
    },
  ];

  const currentHop = JOURNEY_NODES[activeHop];

  return (
    <section className="border-t border-slate-200 dark:border-slate-800/80 bg-[#F4F7FB] dark:bg-[#050914] py-20 px-6">
      <div className="max-w-[1320px] mx-auto space-y-16">
        {/* AGENT + MANDATE + ACTION Spatial Arrangement */}
        <div className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400 tracking-wide">
              CORE DECISION UNIT
            </div>
            <h2
              className="text-3xl lg:text-4xl font-display font-semibold tracking-tight text-slate-950 dark:text-slate-100 leading-tight"
              style={{ textWrap: 'balance' }}
            >
              The decision is not about the agent alone.{' '}
              <span className="text-cyan-700 dark:text-cyan-300">
                It is about the agent, the mandate, and the action.
              </span>
            </h2>
          </div>

          <div className="relative">
            {/* Curved connecting transaction path behind spatial nodes */}
            <svg
              viewBox="0 0 1000 120"
              className="hidden lg:block w-full h-24 absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none"
              aria-hidden="true"
            >
              <path
                d="M 140 72 C 280 72, 340 34, 500 34 C 660 34, 720 72, 860 72"
                fill="none"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="stroke-cyan-600/45 dark:stroke-cyan-400/45"
              />
              <circle
                cx="140"
                cy="72"
                r="4"
                className="fill-cyan-600 dark:fill-cyan-400"
              />
              <circle
                cx="500"
                cy="34"
                r="5"
                className="fill-cyan-600 dark:fill-cyan-400"
              />
              <circle
                cx="860"
                cy="72"
                r="4"
                className="fill-cyan-600 dark:fill-cyan-400"
              />
            </svg>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 py-4">
              {triadNodes.map((node, idx) => (
                <motion.div
                  key={node.role}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.1,
                    ease: SETTLE_EASE,
                  }}
                  className={`p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-xs dark:shadow-none ${node.offset}`}
                >
                  <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                    {node.role}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100 mt-1.5">
                    {node.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-2">
                    {node.meta}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {node.note}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Real Transaction Journey: CUSTOMER -> AGENT -> BANK -> PAYEE */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-6 lg:p-8 shadow-xs dark:shadow-none space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-medium tracking-wide">
                REAL TRANSACTION JOURNEY · ALLOW
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100 mt-1">
                ₹85,000 · ABC Industries · Account ••••4412 · Approved Invoice
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveHop((prev) => (prev + 1) % JOURNEY_NODES.length)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Step Transaction ({currentHop.label})
              </button>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" />
                {currentHop.time} · {currentHop.risk}
              </div>
            </div>
          </div>

          {/* Interactive 4-stage flow bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY_NODES.map((node, idx) => {
              const reached = idx <= activeHop;
              const active = idx === activeHop;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveHop(idx)}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    active
                      ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-50/70 dark:bg-cyan-950/25'
                      : reached
                        ? 'border-emerald-300/70 dark:border-emerald-500/30 bg-slate-50/80 dark:bg-[#070C1A]'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#070C1A] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {node.time}
                    </span>
                    <span
                      className={
                        active
                          ? 'text-cyan-700 dark:text-cyan-300 font-semibold'
                          : 'text-emerald-700 dark:text-emerald-400 font-medium'
                      }
                    >
                      0{idx + 1} · {node.id}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-slate-100 mt-1.5">
                    {node.status}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {node.risk}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
