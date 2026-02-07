interface TopBarProps {
  saveStatus: 'idle' | 'saving' | 'saved';
  onShowHelp: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ saveStatus, onShowHelp, onToggleSidebar, sidebarOpen }: TopBarProps) {
  return (
    <header className="flex items-center justify-between bg-[#143e70] px-3 md:px-5 border-b-[3px] border-[#feed01] flex-shrink-0 h-11 no-select">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-[#feed01] text-lg p-1 hover:bg-white/10 rounded"
          title={sidebarOpen ? 'Zamknij panel' : 'Otwórz panel'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>

        <img
          src="https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/_porr_rgb_screenpng.png"
          alt="PORR"
          className="h-6 md:h-7 flex-shrink-0"
        />
        <span className="text-xs md:text-sm text-white whitespace-nowrap">
          Generator <span className="text-[#feed01] font-bold">Newslettera</span>
        </span>
        <span className="hidden sm:inline bg-[#feed01]/20 text-[#feed01] px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
          v3.0
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Save status indicator */}
        <div className={`hidden sm:flex items-center gap-1.5 text-[11px] transition-colors ${
          saveStatus === 'saving' ? 'text-yellow-400' : 'text-[#00d9a5]'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            saveStatus === 'saving' ? 'bg-yellow-400 animate-pulse-dot' : 'bg-[#00d9a5]'
          }`} />
          <span className="whitespace-nowrap">
            {saveStatus === 'saving' ? 'Zapisywanie...' : 'Zapisano'}
          </span>
        </div>

        {/* Mobile save dot */}
        <span className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          saveStatus === 'saving' ? 'bg-yellow-400 animate-pulse-dot' : 'bg-[#00d9a5]'
        }`} />

        <button
          onClick={onShowHelp}
          className="border border-[#feed01] text-[#feed01] px-2.5 md:px-3 py-1 rounded text-[11px] flex items-center gap-1 hover:bg-[#feed01] hover:text-[#143e70] transition-colors font-medium"
        >
          <span>❓</span>
          <span className="hidden md:inline">Pomoc</span>
        </button>
      </div>
    </header>
  );
}
