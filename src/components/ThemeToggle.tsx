import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../theme/ThemeContext';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Theme: ${mode} (${resolvedTheme}) — click to toggle`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-200 hover:border-cyan-600 dark:hover:border-cyan-400 transition-colors text-xs font-medium whitespace-nowrap shrink-0"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span>{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
      </button>
    );
  }

  const options: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
    { id: 'system', label: 'System', Icon: Monitor },
  ];

  return (
    <div
      role="group"
      aria-label="Theme mode"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B1120] shrink-0"
    >
      {options.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={active}
            title={`${label} theme`}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              active
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
