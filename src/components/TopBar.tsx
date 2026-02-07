import { cn } from '@/utils/cn';

interface TopBarProps {
  saveStatus: 'idle' | 'saving' | 'saved';
  onShowHelp: () => void;
  articleCount: number;
  wordCount: number;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ saveStatus, onShowHelp, articleCount, wordCount, onToggleSidebar, sidebarOpen }: TopBarProps) {
  return (
    <header className="relative flex h-11 shrink-0 items-center justify-between bg-gradient-to-r from-[#071224] via-[#0d2240] to-[#071224] px-2 sm:px-4 select-none">
      {/* Accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#feed01]/80 to-transparent" />

      {/* Left */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-[#feed01] transition-colors md:hidden active:scale-95"
          aria-label="Menu"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {sidebarOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#feed01]/15 to-[#feed01]/5 border border-[#feed01]/10">
            <img
              src="https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/_porr_rgb_screenpng.png"
              alt="PORR" className="h-4 w-auto"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-wide block truncate">
              Newsletter <span className="gradient-text">Generator</span>
            </span>
            <span className="hidden sm:block text-[7px] text-gray-600 tracking-[0.15em] uppercase">PORR Polska</span>
          </div>
        </div>

        <span className="hidden lg:inline rounded-full bg-[#feed01]/10 border border-[#feed01]/15 px-2 py-0.5 text-[8px] font-bold text-[#feed01] tracking-wider shrink-0">
          v3.0
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Stats */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 border border-white/[0.04]">
            <span className="text-[8px]">📰</span>
            <span className="text-[9px] font-semibold tabular-nums text-gray-400">{articleCount}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 border border-white/[0.04]">
            <span className="text-[8px]">📝</span>
            <span className="text-[9px] font-semibold tabular-nums text-gray-400">{wordCount}</span>
          </div>
        </div>

        {/* Save status */}
        <div className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium transition-all',
          saveStatus === 'saving'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
        )}>
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
          )} />
          <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Zapisywanie...' : 'Zapisano'}</span>
          <span className="sm:hidden">{saveStatus === 'saving' ? '...' : '✓'}</span>
        </div>

        {/* Help */}
        <button
          onClick={onShowHelp}
          className="flex h-7 items-center gap-1 rounded-lg border border-white/8 bg-white/[0.04] px-2 text-[10px] font-medium text-gray-400 hover:border-[#feed01]/30 hover:bg-[#feed01]/8 hover:text-[#feed01] transition-all active:scale-95"
        >
          <span className="text-[10px]">❓</span>
          <span className="hidden sm:inline">Pomoc</span>
        </button>
      </div>
    </header>
  );
}
