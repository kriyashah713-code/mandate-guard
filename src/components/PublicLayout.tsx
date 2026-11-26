import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Shield, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Product' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/use-cases', label: 'Use Cases' },
  { to: '/technology', label: 'Technology' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAppState();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const workspaceHref =
    user?.role === 'ANALYST'
      ? '/operations'
      : user?.role === 'CUSTOMER'
        ? '/customer'
        : '/login';

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#050914] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Minimal Institutional Navigation */}
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
          scrolled
            ? 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#050914]/95 shadow-xs dark:shadow-none'
            : 'border-slate-200/70 dark:border-slate-800/70 bg-[#F4F7FB]/95 dark:bg-[#050914]/95'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-base sm:text-lg font-display font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Mandate Guard
          </Link>

          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {NAV_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    active
                      ? 'text-slate-950 dark:text-slate-100 border-cyan-600 dark:border-cyan-400'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle compact />
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Switch Role' : 'Login'}
            </Link>
            <Link
              to={workspaceHref}
              state={user ? undefined : { presetRole: 'ANALYST' }}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Open Console' : 'Launch Console'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070C1A] px-6 py-4 space-y-3">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`py-2 ${
                    pathname === item.to
                      ? 'text-cyan-700 dark:text-cyan-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/demo"
                className="py-2 text-slate-700 dark:text-slate-300"
              >
                Flagship Demo
              </Link>
            </nav>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Link
                to="/login"
                className="flex-1 text-center py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                Login
              </Link>
              <Link
                to={workspaceHref}
                state={user ? undefined : { presetRole: 'ANALYST' }}
                className="flex-1 text-center py-2 text-xs font-semibold bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg"
              >
                Launch Console
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-clip">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#040711] py-10 px-6 transition-colors duration-200">
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <p className="text-slate-900 dark:text-slate-200 font-medium mb-1">
              Mandate Guard — Know Your Agent (KYA) Risk Operations
            </p>
            <p>
              Action-by-action financial authority verification for delegated AI
              agents.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              to="/how-it-works"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              How It Works
            </Link>
            <Link
              to="/use-cases"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Use Cases
            </Link>
            <Link
              to="/technology"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Technology
            </Link>
            <Link
              to="/demo"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Flagship Demo
            </Link>
            <Link
              to="/login"
              className="hover:text-slate-900 dark:hover:text-slate-200"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
