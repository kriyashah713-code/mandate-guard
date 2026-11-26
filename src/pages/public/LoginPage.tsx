import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, UserCheck, ShieldAlert } from 'lucide-react';
import { PublicLayout } from '../../components/PublicLayout';
import { useAppState } from '../../context/AppStateContext';
import type { UserRole } from '../../types/domain';

export function LoginPage() {
  const { loginAsRole } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    from?: string;
    presetRole?: UserRole;
  } | null;
  const from = state?.from;
  const initialRole: UserRole = state?.presetRole || 'ANALYST';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(
    initialRole === 'CUSTOMER'
      ? 'arvind.mehta@mehtaprecision.in'
      : 'priya.nair@bharatfinbank.in',
  );

  const handleQuickLogin = (role: UserRole) => {
    loginAsRole(role);
    if (role === 'ANALYST') {
      navigate(from && !from.startsWith('/customer') ? from : '/operations', {
        replace: true,
      });
    } else {
      navigate(from && from.startsWith('/customer') ? from : '/customer', {
        replace: true,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const detectedRole: UserRole = email.toLowerCase().includes('mehta')
      ? 'CUSTOMER'
      : selectedRole;
    loginAsRole(detectedRole, email);
    if (detectedRole === 'ANALYST') {
      navigate(from && !from.startsWith('/customer') ? from : '/operations', {
        replace: true,
      });
    } else {
      navigate(from && from.startsWith('/customer') ? from : '/customer', {
        replace: true,
      });
    }
  };

  return (
    <PublicLayout>
      <section className="max-w-[1040px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400">
              <Shield className="w-4 h-4" />
              Role-Based Access Control
            </div>
            <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-slate-100">
              Sign in to Mandate Guard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Select a role workspace to inspect live agent mandates, Step-Up
              confirmations, or Risk Operations investigations. Customer
              sessions are strictly isolated from Analyst routes.
            </p>

            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => handleQuickLogin('ANALYST')}
                className="w-full text-left p-5 rounded-xl border border-cyan-300 dark:border-cyan-500/40 bg-white dark:bg-[#0B1120] hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors shadow-xs dark:shadow-none"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400">
                    <ShieldAlert className="w-4 h-4" />
                    ROLE B · PRIMARY USER
                  </span>
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    Enter Workspace →
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-950 dark:text-slate-100">
                  Risk / Fraud Analyst — Priya Nair
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Operations, Live Sessions, Mandate Diff, Fraud Cases,
                  Simulation Lab &amp; Evaluation.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER')}
                className="w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-xs dark:shadow-none"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                    ROLE A · PRINCIPAL
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Enter Workspace →
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-950 dark:text-slate-100">
                  Customer / Principal — Arvind Mehta
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Create mandates, manage supplier limits, and approve or reject
                  Step-Up alerts (&ldquo;NOT ME&rdquo;).
                </div>
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] rounded-xl p-8 space-y-5 shadow-xs dark:shadow-none"
          >
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              Standard Role Sign-In
            </h2>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#050914] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                Role Detection Override
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ANALYST');
                    setEmail('priya.nair@bharatfinbank.in');
                  }}
                  className={`py-2.5 px-4 rounded-lg border text-xs font-medium transition-colors ${
                    selectedRole === 'ANALYST'
                      ? 'border-cyan-600 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Risk / Fraud Analyst
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('CUSTOMER');
                    setEmail('arvind.mehta@mehtaprecision.in');
                  }}
                  className={`py-2.5 px-4 rounded-lg border text-xs font-medium transition-colors ${
                    selectedRole === 'CUSTOMER'
                      ? 'border-cyan-600 dark:border-cyan-400 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Principal / Customer
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors"
            >
              Authenticate &amp; Launch Workspace
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
