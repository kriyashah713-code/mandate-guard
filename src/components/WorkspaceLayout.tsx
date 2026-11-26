import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Box,
  FileCheck2,
  FlaskConical,
  FileWarning,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
  UserCheck,
  ArrowLeftRight,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { UserRole } from '../types/domain';
import { formatCompactInr } from '../utils/format';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeCount?: number;
}

export function WorkspaceLayout({
  role,
  breadcrumb,
  action,
  children,
}: {
  role: UserRole;
  breadcrumb: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout, transactions, cases, totalLossPreventedInr } =
    useAppState();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const pendingApprovals = transactions.filter(
    (t) =>
      t.principalId === (user?.principalId || 'prin-mehta-01') &&
      t.customerApprovalStatus === 'PENDING' &&
      (t.decision.decision === 'HOLD' || t.decision.decision === 'STEP-UP'),
  ).length;

  const attentionTxCount = transactions.filter(
    (t) =>
      t.decision.decision === 'HOLD' ||
      t.decision.decision === 'STEP-UP' ||
      t.analystReviewStatus === 'ESCALATED',
  ).length;

  const openCasesCount = cases.filter(
    (c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION',
  ).length;

  const customerNav: NavItem[] = [
    { to: '/customer', label: 'Overview', icon: LayoutDashboard },
    { to: '/customer/mandates', label: 'My Mandates', icon: FileCheck2 },
    { to: '/customer/agents', label: 'My Agents', icon: Bot },
    {
      to: '/customer/transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
    },
    {
      to: '/customer/approvals',
      label: 'Approvals',
      icon: UserCheck,
      badgeCount: pendingApprovals,
    },
    {
      to: '/customer/security',
      label: 'Security & Profile',
      icon: ShieldCheck,
    },
  ];

  const analystNav: NavItem[] = [
    { to: '/operations', label: 'Operations', icon: LayoutDashboard },
    { to: '/sessions', label: 'Live Sessions', icon: Activity },
    { to: '/agents', label: 'Agents', icon: Bot },
    { to: '/mandates', label: 'Mandates', icon: FileCheck2 },
    {
      to: '/transactions',
      label: 'Transactions',
      icon: ListChecks,
      badgeCount: attentionTxCount,
    },
    {
      to: '/cases',
      label: 'Fraud Cases',
      icon: FileWarning,
      badgeCount: openCasesCount || cases.length,
    },
    { to: '/simulations', label: 'Simulation Lab', icon: FlaskConical },
    { to: '/mandate-space', label: 'Mandate Space 3D', icon: Box },
    { to: '/evaluation', label: 'Evaluation', icon: LineChart },
  ];

  const navItems = role === 'CUSTOMER' ? customerNav : analystNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarBody = (
    <>
      <div>
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-base font-display font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap"
          >
            <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Mandate Guard
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close workspace navigation"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            {role === 'CUSTOMER'
              ? 'Principal Workspace'
              : 'Risk Operations Workspace'}
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user?.name}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {user?.organization}
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isRoot =
              item.to === '/customer' || item.to === '/operations';
            const active = isRoot
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-cyan-50 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="font-mono text-xs text-amber-700 dark:text-amber-300 tabular-nums">
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
        {role === 'ANALYST' && (
          <div className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Loss Prevented
            </div>
            <div className="text-base font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              {formatCompactInr(totalLossPreventedInr)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Link
            to="/demo"
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            Flagship Demo
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#050914] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Left Sidebar (256px) */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070C1A] flex-col justify-between sticky top-0 h-screen overflow-y-auto transition-colors duration-200">
        {sidebarBody}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070C1A] flex flex-col justify-between h-full overflow-y-auto">
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#050914] flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open workspace navigation"
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
              {breadcrumb}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle compact />
            {action}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
