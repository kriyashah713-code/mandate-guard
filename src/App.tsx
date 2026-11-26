import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { AppStateProvider } from './context/AppStateContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { LandingPage } from './pages/public/LandingPage';

const HowItWorksPage = lazy(() =>
  import('./pages/public/HowItWorksPage').then((m) => ({
    default: m.HowItWorksPage,
  })),
);
const UseCasesPage = lazy(() =>
  import('./pages/public/UseCasesPage').then((m) => ({
    default: m.UseCasesPage,
  })),
);
const TechnologyPage = lazy(() =>
  import('./pages/public/TechnologyPage').then((m) => ({
    default: m.TechnologyPage,
  })),
);
const DemoPage = lazy(() =>
  import('./pages/public/DemoPage').then((m) => ({ default: m.DemoPage })),
);
const LoginPage = lazy(() =>
  import('./pages/public/LoginPage').then((m) => ({ default: m.LoginPage })),
);

const CustomerOverview = lazy(() =>
  import('./pages/customer/CustomerOverview').then((m) => ({
    default: m.CustomerOverview,
  })),
);
const CustomerMandates = lazy(() =>
  import('./pages/customer/CustomerMandates').then((m) => ({
    default: m.CustomerMandates,
  })),
);
const CustomerAgents = lazy(() =>
  import('./pages/customer/CustomerAgents').then((m) => ({
    default: m.CustomerAgents,
  })),
);
const CustomerTransactions = lazy(() =>
  import('./pages/customer/CustomerTransactions').then((m) => ({
    default: m.CustomerTransactions,
  })),
);
const CustomerApprovals = lazy(() =>
  import('./pages/customer/CustomerApprovals').then((m) => ({
    default: m.CustomerApprovals,
  })),
);
const CustomerSecurity = lazy(() =>
  import('./pages/customer/CustomerSecurity').then((m) => ({
    default: m.CustomerSecurity,
  })),
);

const OperationsPage = lazy(() =>
  import('./pages/analyst/OperationsPage').then((m) => ({
    default: m.OperationsPage,
  })),
);
const SessionsPage = lazy(() =>
  import('./pages/analyst/SessionsPage').then((m) => ({
    default: m.SessionsPage,
  })),
);
const AgentsPage = lazy(() =>
  import('./pages/analyst/AgentsPage').then((m) => ({ default: m.AgentsPage })),
);
const AgentDetailPage = lazy(() =>
  import('./pages/analyst/AgentDetailPage').then((m) => ({
    default: m.AgentDetailPage,
  })),
);
const MandatesPage = lazy(() =>
  import('./pages/analyst/MandatesPage').then((m) => ({
    default: m.MandatesPage,
  })),
);
const MandateDetailPage = lazy(() =>
  import('./pages/analyst/MandateDetailPage').then((m) => ({
    default: m.MandateDetailPage,
  })),
);
const TransactionsPage = lazy(() =>
  import('./pages/analyst/TransactionsPage').then((m) => ({
    default: m.TransactionsPage,
  })),
);
const TransactionDetailPage = lazy(() =>
  import('./pages/analyst/TransactionDetailPage').then((m) => ({
    default: m.TransactionDetailPage,
  })),
);
const CasesPage = lazy(() =>
  import('./pages/analyst/CasesPage').then((m) => ({ default: m.CasesPage })),
);
const CaseDetailPage = lazy(() =>
  import('./pages/analyst/CaseDetailPage').then((m) => ({
    default: m.CaseDetailPage,
  })),
);
const SimulationsPage = lazy(() =>
  import('./pages/analyst/SimulationsPage').then((m) => ({
    default: m.SimulationsPage,
  })),
);
const EvaluationPage = lazy(() =>
  import('./pages/analyst/EvaluationPage').then((m) => ({
    default: m.EvaluationPage,
  })),
);
const MandateSpacePage = lazy(() =>
  import('./pages/analyst/MandateSpacePage').then((m) => ({
    default: m.MandateSpacePage,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#050914] text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-mono">
      Loading Mandate Guard workspace...
    </div>
  );
}

class WorkspaceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#050914] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-6 space-y-4 text-center">
            <h1 className="text-lg font-semibold">Workspace View Interrupted</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A view module failed to load. Reload to restore the Mandate Guard session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <BrowserRouter>
          <WorkspaceErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Experience */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/use-cases" element={<UseCasesPage />} />
              <Route path="/technology" element={<TechnologyPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Role A: Principal / Customer Workspace */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/mandates"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerMandates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/agents"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerAgents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/transactions"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/approvals"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/security"
                element={
                  <ProtectedRoute allowedRole="CUSTOMER">
                    <CustomerSecurity />
                  </ProtectedRoute>
                }
              />

              {/* Role B: Risk / Fraud Analyst Workspace */}
              <Route
                path="/operations"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <OperationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <SessionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <AgentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents/:id"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <AgentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mandates"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <MandatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mandates/:id"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <MandateDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/:id"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <TransactionDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <CasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <CaseDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simulations"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <SimulationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mandate-space"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <MandateSpacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <ProtectedRoute allowedRole="ANALYST">
                    <EvaluationPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </WorkspaceErrorBoundary>
        </BrowserRouter>
      </AppStateProvider>
    </ThemeProvider>
  );
}
