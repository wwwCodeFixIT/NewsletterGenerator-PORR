import { useCallback, useRef } from 'react';
import type { useNewsletterStore } from '@/hooks/useNewsletterStore';
import type { TabId, NotificationType, SavedProject } from '@/types';
import { ContentTab } from './Sidebar/ContentTab';
import { ArticlesTab } from './Sidebar/ArticlesTab';
import { FeedbackTab } from './Sidebar/FeedbackTab';
import { StyleTab } from './Sidebar/StyleTab';
import { ExportTab } from './Sidebar/ExportTab';
import { formatBytes } from '@/utils/format';

type Store = ReturnType<typeof useNewsletterStore>;

export interface SidebarProps {
  store: Store;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onShowTemplates: () => void;
  onShowLibrary: () => void;
  onLoadProjectFromFile: (file: File) => void;
  onShowCode: () => void;
  onShowOutlookHelp: () => void;
  notify: (msg: string, type?: NotificationType) => void;
  html: string;
  isOpen: boolean;
  onClose: () => void;
}

const tabsList: { id: TabId; label: string; icon: string }[] = [
  { id: 'content', label: 'Treść', icon: '📝' },
  { id: 'articles', label: 'Artykuły', icon: '📰' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
  { id: 'style', label: 'Styl', icon: '🎨' },
  { id: 'export', label: 'Eksport', icon: '📤' },
];

function QuickActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/[0.05] bg-gradient-to-br from-[#0f2847]/60 to-[#0a1628]/60 py-2 px-1 text-gray-400 hover:border-[#feed01]/30 hover:text-[#feed01] transition-all text-center group active:scale-95"
    >
      <span className="text-base block group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[8px] font-medium mt-0.5 block">{label}</span>
    </button>
  );
}

export function Sidebar(props: SidebarProps) {
  const {
    store,
    activeTab,
    onTabChange,
    onNewProject,
    onSaveProject,
    onShowTemplates,
    onShowLibrary,
    onLoadProjectFromFile,
    isOpen,
    onClose,
  } = props;
  const loadRef = useRef<HTMLInputElement>(null);
  const library = store.getLibrary();
  const libraryStats = store.getLibraryStats();

  const handleLoadLibraryEntry = useCallback((p: SavedProject) => {
    if (store.loadFromLibrary(p.id)) {
      props.notify(`✅ Wczytano projekt „${p.name}”!`);
    } else {
      props.notify('❌ Nie udało się wczytać tego projektu.', 'error');
    }
  }, [store, props]);

  const handleOpenProjectFile = useCallback(() => {
    loadRef.current?.click();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[320px] lg:w-80 bg-[#16213e] flex flex-col border-r-2 border-[#143e70] flex-shrink-0 min-h-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:transform-none
        `}
      >
        {/* Quick actions bar */}
        <div className="flex-shrink-0 p-2 pb-0">
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <QuickActionButton icon="📄" label="Nowy" onClick={onNewProject} />
            <QuickActionButton icon="📂" label="Otwórz" onClick={handleOpenProjectFile} />
            <QuickActionButton icon="💾" label="Zapisz" onClick={onSaveProject} />
            <QuickActionButton icon="📋" label="Szablony" onClick={onShowTemplates} />
            <input
              ref={loadRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onLoadProjectFromFile(f); e.target.value = ''; }}
            />
          </div>

          {/* Biblioteka projektów */}
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 mb-2">
            <div className="mb-1 flex items-center justify-between">
              <h4 className="text-[#feed01] text-[9px] font-bold uppercase tracking-wider">
                📚 Biblioteka {library.length > 0 && <span className="text-gray-500 font-normal">({formatBytes(libraryStats.bytes)})</span>}
              </h4>
              <button onClick={onShowLibrary} className="text-[8px] text-gray-500 hover:text-[#feed01] transition-colors">
                Zarządzaj →
              </button>
            </div>
            {library.length === 0 ? (
              <p className="text-[9px] text-gray-600 py-0.5">Brak zapisanych projektów.</p>
            ) : (
              <div className="space-y-0.5">
                {library.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadLibraryEntry(p)}
                    className="flex items-center justify-between px-2 py-1 bg-[#0d1b2a]/60 rounded cursor-pointer hover:bg-[#143e70] transition-colors group"
                  >
                    <span className="text-white/80 text-[10px] truncate flex-1 group-hover:text-white">{p.name}</span>
                    <span className="text-gray-600 text-[8px] ml-2 flex-shrink-0">{new Date(p.savedAt).toLocaleDateString('pl')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <div className="flex bg-[#0d1b2a]/60 rounded-lg overflow-hidden mb-2">
            {tabsList.map(t => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 py-1.5 text-[9px] text-center transition-all flex flex-col items-center gap-0.5 ${
                  activeTab === t.id
                    ? 'bg-[#143e70] text-[#feed01] font-bold shadow-inner'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-xs">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0 touch-scroll">
          {activeTab === 'content' && <ContentTab state={store.state} update={store.update} />}
          {activeTab === 'articles' && (
            <ArticlesTab
              state={store.state}
              update={store.update}
              addArticle={store.addArticle}
              deleteArticle={store.removeArticle}
              duplicateArticle={store.duplicateArticle}
              moveArticle={store.moveArticle}
              updateArticle={store.updateArticle}
            />
          )}
          {activeTab === 'feedback' && (
            <FeedbackTab
              state={store.state}
              update={store.update}
              setFeedbackStyle={store.setFeedbackStyle}
              addFeedbackOption={store.addFeedbackOption}
              deleteFeedbackOption={store.removeFeedbackOption}
              updateFeedbackOption={store.updateFeedbackOption}
            />
          )}
          {activeTab === 'style' && <StyleTab state={store.state} update={store.update} />}
          {activeTab === 'export' && (
            <ExportTab
              state={store.state}
              html={props.html}
              notify={props.notify}
              onShowCode={props.onShowCode}
              onShowOutlookHelp={props.onShowOutlookHelp}
              onShowLibrary={onShowLibrary}
              loadState={store.loadState}
            />
          )}
        </div>
      </aside>
    </>
  );
}
