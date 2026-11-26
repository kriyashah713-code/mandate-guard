import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { UserRole } from '../types/domain';

interface ProtectedRouteProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { user, logout } = useAppState();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== allowedRole) {
    const homeRoute = user.role === 'CUSTOMER' ? '/customer' : '/operations';
    const requiredLabel =
      allowedRole === 'ANALYST'
        ? 'Risk / Fraud Analyst'
        : 'Principal / Customer';

    return (
      <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#050914] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0B1120] rounded-xl p-8 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium tracking-wide">
              403 · Role Authorization Required
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Access restricted to {requiredLabel} sessions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            You are currently authenticated as{' '}
            <span className="text-slate-900 dark:text-slate-200 font-medium">
              {user.name}
            </span>{' '}
            (
            {user.role === 'CUSTOMER'
              ? 'Customer Principal'
              : 'Fraud Operations Analyst'}
            ). Route{' '}
            <span className="font-mono text-slate-800 dark:text-slate-300">
              {location.pathname}
            </span>{' '}
            is protected by role-based access control and cannot be opened under
            your current role.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={homeRoute}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to My Workspace
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Switch Role / Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
