import { useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* ========== INPUT ========== */
interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon?: string;
}

export function Input({ label, value, onChange, type = 'text', placeholder, icon }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-1.5">
      <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-gray-500">
        {icon && <span className="text-[9px]">{icon}</span>}
        {label}
      </label>
      <div className={cn(
        'rounded-lg border transition-all duration-200',
        focused ? 'border-[#feed01]/40 ring-1 ring-[#feed01]/10' : 'border-white/[0.06] hover:border-white/10'
      )}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-[#0d1b2a]/80 px-2.5 py-[6px] text-[11px] text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ========== TEXTAREA ========== */
interface TextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
}

export function TextArea({ label, value, onChange, rows = 2, placeholder }: TextAreaProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-1.5">
      <label className="mb-0.5 flex items-center justify-between text-[10px] font-medium text-gray-500">
        <span>{label}</span>
        <span className="text-[8px] tabular-nums text-gray-700">{value.length}</span>
      </label>
      <div className={cn(
        'rounded-lg border transition-all duration-200',
        focused ? 'border-[#feed01]/40 ring-1 ring-[#feed01]/10' : 'border-white/[0.06] hover:border-white/10'
      )}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y rounded-lg bg-[#0d1b2a]/80 px-2.5 py-[6px] text-[11px] leading-relaxed text-white placeholder-gray-600 focus:outline-none min-h-[44px]"
        />
      </div>
    </div>
  );
}

/* ========== COLOR INPUT ========== */
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="mb-1.5">
      <label className="mb-0.5 block text-[10px] font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#0d1b2a]/80 p-1 hover:border-white/10 transition-colors">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-6 w-7 shrink-0 cursor-pointer rounded"
        />
        <input
          type="text"
          value={value}
          onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') onChange(e.target.value); }}
          className="flex-1 bg-transparent px-1 text-[10px] font-mono text-white focus:outline-none min-w-0"
        />
        <div className="h-4 w-4 shrink-0 rounded border border-white/10 shadow-inner" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

/* ========== SELECT ========== */
interface SelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="mb-1.5">
      <label className="mb-0.5 block text-[10px] font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/[0.06] bg-[#0d1b2a]/80 px-2.5 py-[6px] text-[11px] text-white hover:border-white/10 focus:border-[#feed01]/40 focus:outline-none appearance-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#0a1628]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ========== TOGGLE ========== */
interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}

export function Toggle({ label, value, onChange, description }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-2 rounded-lg bg-white/[0.015] px-2 py-1.5 transition-colors hover:bg-white/[0.03] text-left active:scale-[0.99]"
    >
      <div className={cn(
        'relative h-[18px] w-[32px] shrink-0 rounded-full transition-all duration-300',
        value ? 'bg-gradient-to-r from-[#00d9a5] to-[#00b894]' : 'bg-gray-700'
      )}>
        <span className={cn(
          'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all duration-300',
          value ? 'left-[15px]' : 'left-[2px]'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-gray-300 block truncate">{label}</span>
        {description && <p className="text-[8px] text-gray-600 truncate">{description}</p>}
      </div>
      <span className={cn(
        'text-[8px] font-bold uppercase tracking-wider shrink-0',
        value ? 'text-emerald-400' : 'text-gray-600'
      )}>
        {value ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

/* ========== SECTION ========== */
interface SectionProps {
  title: string;
  icon: string;
  children: ReactNode;
  collapsible?: boolean;
  badge?: string;
  defaultCollapsed?: boolean;
}

export function Section({ title, icon, children, collapsible = true, badge, defaultCollapsed = false }: SectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div className="mb-2 rounded-xl border border-white/[0.05] bg-gradient-to-br from-[#0f2847]/50 to-[#0a1628]/50 overflow-hidden transition-all">
      {collapsible ? (
        <button
          className="flex w-full items-center justify-between px-2.5 py-2 transition-colors hover:bg-white/[0.02] active:bg-white/[0.03]"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] shrink-0">{icon}</span>
            <h3 className="text-[10px] font-bold text-white tracking-wide truncate uppercase">{title}</h3>
            {badge && (
              <span className="rounded-full bg-[#feed01]/10 border border-[#feed01]/20 px-1.5 text-[7px] font-bold text-[#feed01] shrink-0">{badge}</span>
            )}
          </div>
          <svg
            className={cn('h-3 w-3 text-gray-600 transition-transform duration-200 shrink-0', collapsed ? '-rotate-90' : '')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
          <span className="text-[11px]">{icon}</span>
          <h3 className="text-[10px] font-bold text-white tracking-wide uppercase">{title}</h3>
          {badge && (
            <span className="rounded-full bg-[#feed01]/10 border border-[#feed01]/20 px-1.5 text-[7px] font-bold text-[#feed01]">{badge}</span>
          )}
        </div>
      )}
      <div className={cn(
        'transition-all duration-300 overflow-hidden',
        collapsed ? 'max-h-0 opacity-0' : 'max-h-[9999px] opacity-100'
      )}>
        <div className="px-2.5 pb-2 pt-0.5">{children}</div>
      </div>
    </div>
  );
}
