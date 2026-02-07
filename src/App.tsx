import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNewsletterStore } from '@/hooks/useNewsletterStore';
import { useNotification } from '@/hooks/useNotification';
import { generateEmailHTML, downloadFile } from '@/utils/emailGenerator';
import { TopBar } from '@/components/TopBar';
import { Preview } from '@/components/Preview';
import { Notifications } from '@/components/Notifications';
import { ContentTab } from '@/components/Sidebar/ContentTab';
import { ArticlesTab } from '@/components/Sidebar/ArticlesTab';
import { FeedbackTab } from '@/components/Sidebar/FeedbackTab';
import { StyleTab } from '@/components/Sidebar/StyleTab';
import { ExportTab } from '@/components/Sidebar/ExportTab';
import { HelpModal } from '@/components/Modals/HelpModal';
import { CodeModal } from '@/components/Modals/CodeModal';
import { OutlookHelpModal } from '@/components/Modals/OutlookHelpModal';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import type { TabId, RecentProject } from '@/types';
import { cn } from '@/utils/cn';

const tabs: { id: TabId; label: string; icon: string; mobileLabel: string }[] = [
  { id: 'content', label: 'Treść', icon: '📝', mobileLabel: 'Treść' },
  { id: 'articles', label: 'Artykuły', icon: '📰', mobileLabel: 'Art.' },
  { id: 'feedback', label: 'Feedback', icon: '💬', mobileLabel: 'FB' },
  { id: 'style', label: 'Styl', icon: '🎨', mobileLabel: 'Styl' },
  { id: 'export', label: 'Eksport', icon: '📤', mobileLabel: 'Exp.' },
];

export function App() {
  const {
    state, update, saveStatus,
    addArticle, deleteArticle, moveArticle, updateArticle,
    addFeedbackOption, deleteFeedbackOption, updateFeedbackOption,
    setFeedbackStyle, resetProject, loadState, getRecentProjects,
  } = useNewsletterStore();

  const { notifications, show: notify, dismiss } = useNotification();

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [showHelp, setShowHelp] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showOutlookHelp, setShowOutlookHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const previewHtml = useMemo(() => generateEmailHTML(state), [state]);

  const wordCount = useMemo(() => {
    const all = [
      state.mainTitle, state.mainDescription, state.videoTitle, state.videoDescription,
      state.footerTitle, state.footerLeft, state.footerRight,
      ...state.articles.map(a => `${a.title} ${a.description}`),
    ].join(' ');
    return all.split(/\s+/).filter(Boolean).length;
  }, [state]);

  // Responsive check
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load recent projects
  useEffect(() => {
    setRecentProjects(getRecentProjects());
  }, [getRecentProjects, saveStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's': e.preventDefault(); notify('Projekt zapisany lokalnie!'); break;
          case 'e': e.preventDefault(); downloadFile(previewHtml, 'newsletter.html', 'text/html;charset=utf-8'); notify('HTML pobrany!'); break;
          case 'p': e.preventDefault(); window.open(URL.createObjectURL(new Blob([previewHtml], { type: 'text/html' })), '_blank'); break;
          case 'n': e.preventDefault(); if (confirm('Utworzyć nowy projekt?')) { resetProject(); notify('Nowy projekt!'); } break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewHtml, notify, resetProject]);

  const handleShowCode = useCallback((code: string) => { setCodeContent(code); setShowCode(true); }, []);
  const closeSidebarOnMobile = () => { if (isMobile) setSidebarOpen(false); };

  const handleNewProject = () => { if (confirm('Nowy projekt?')) { resetProject(); notify('Nowy projekt!'); } };
  const handleSaveProject = () => notify('Zapisano lokalnie!');
  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = e => { try { loadState(JSON.parse(e.target?.result as string)); notify('Wczytano!'); } catch { notify('Błąd!', 'error'); } };
      reader.readAsText(file);
    };
    input.click();
  };

  const quickActions = [
    { icon: '📄', label: 'Nowy', onClick: handleNewProject },
    { icon: '📂', label: 'Otwórz', onClick: handleLoadProject },
    { icon: '💾', label: 'Zapisz', onClick: handleSaveProject },
    { icon: '📋', label: 'Szablony', onClick: () => setShowTemplates(true) },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#080c16] text-white">
      {/* Top Bar */}
      <TopBar
        saveStatus={saveStatus}
        onShowHelp={() => setShowHelp(true)}
        articleCount={state.articles.length}
        wordCount={wordCount}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={closeSidebarOnMobile} />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'flex flex-col overflow-hidden border-r border-white/[0.04] bg-gradient-to-b from-[#0c1a2e] to-[#080c16] transition-all duration-300 z-30',
            isMobile
              ? cn('absolute top-0 bottom-0 left-0 w-[min(300px,85vw)] shadow-2xl shadow-black/80', sidebarOpen ? 'translate-x-0' : '-translate-x-full')
              : cn(sidebarOpen ? 'w-[320px] lg:w-[350px] xl:w-[370px]' : 'w-0')
          )}
        >
          {/* Quick Actions */}
          <div className="shrink-0 border-b border-white/[0.04] p-1.5">
            <div className="grid grid-cols-4 gap-0.5">
              {quickActions.map(a => (
                <button key={a.label} onClick={a.onClick}
                  className="group flex flex-col items-center gap-0 rounded-lg bg-white/[0.02] p-1.5 text-[7px] font-semibold text-gray-600 hover:bg-white/[0.04] hover:text-[#feed01] transition-all active:scale-95">
                  <span className="text-[11px] group-hover:scale-110 transition-transform">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="shrink-0 border-b border-white/[0.04] px-2 py-1">
              <h4 className="mb-0.5 text-[7px] font-bold uppercase tracking-[0.15em] text-gray-600 px-0.5">📁 Ostatnie</h4>
              <div className="space-y-0.5">
                {recentProjects.slice(0, 3).map((r, i) => (
                  <div key={i} onClick={() => { loadState(r.data); notify('Wczytano!'); closeSidebarOnMobile(); }}
                    className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-0.5 text-[8px] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <span className="truncate font-medium text-gray-400">{r.name}</span>
                    <span className="shrink-0 text-[7px] text-gray-600 ml-2">{new Date(r.date).toLocaleDateString('pl')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="shrink-0 border-b border-white/[0.04] px-1.5 py-1">
            <div className="flex overflow-hidden rounded-lg bg-black/20 p-0.5">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'relative flex flex-1 flex-col items-center gap-0 rounded-md py-1 text-center transition-all',
                    activeTab === t.id
                      ? 'bg-gradient-to-b from-[#feed01]/10 to-transparent text-[#feed01]'
                      : 'text-gray-600 hover:text-gray-400'
                  )}>
                  <span className="text-[10px]">{t.icon}</span>
                  <span className="text-[7px] font-bold">{t.mobileLabel}</span>
                  {activeTab === t.id && <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] rounded-full bg-[#feed01]/60" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-1.5 touch-scroll">
            {activeTab === 'content' && <ContentTab state={state} update={update} />}
            {activeTab === 'articles' && (
              <ArticlesTab state={state} update={update} addArticle={addArticle}
                deleteArticle={deleteArticle} moveArticle={moveArticle} updateArticle={updateArticle} />
            )}
            {activeTab === 'feedback' && (
              <FeedbackTab state={state} update={update} setFeedbackStyle={setFeedbackStyle}
                addFeedbackOption={addFeedbackOption} deleteFeedbackOption={deleteFeedbackOption} updateFeedbackOption={updateFeedbackOption} />
            )}
            {activeTab === 'style' && <StyleTab state={state} update={update} />}
            {activeTab === 'export' && (
              <ExportTab state={state} notify={notify} onShowCode={handleShowCode}
                onShowOutlookHelp={() => setShowOutlookHelp(true)} loadState={loadState} />
            )}
          </div>

          {/* Mobile close */}
          {isMobile && (
            <div className="shrink-0 border-t border-white/[0.04] p-1.5 mobile-bottom-safe">
              <button onClick={closeSidebarOnMobile}
                className="w-full rounded-lg bg-[#feed01]/8 border border-[#feed01]/15 px-2 py-1.5 text-[10px] font-bold text-[#feed01] hover:bg-[#feed01]/15 transition-all active:scale-[0.98]">
                ✓ Zamknij panel edycji
              </button>
            </div>
          )}
        </aside>

        {/* Desktop toggle */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className={cn(
              'absolute top-2 z-10 flex h-5 w-5 items-center justify-center rounded-r-md bg-[#0c1a2e] border border-l-0 border-white/[0.06] text-gray-600 hover:text-[#feed01] hover:bg-white/5 transition-all',
              sidebarOpen ? 'left-[320px] lg:left-[350px] xl:left-[370px]' : 'left-0'
            )}
            title={sidebarOpen ? 'Zwiń sidebar' : 'Rozwiń sidebar'}
          >
            <svg className={cn('h-2.5 w-2.5 transition-transform', sidebarOpen ? '' : 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Preview */}
        <Preview html={previewHtml} />
      </div>

      {/* Mobile bottom nav */}
      {isMobile && !sidebarOpen && (
        <nav className="shrink-0 border-t border-white/[0.04] bg-[#080c16] mobile-bottom-safe">
          <div className="flex">
            <button onClick={() => setSidebarOpen(true)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[#feed01]">
              <span className="text-[11px]">✏️</span>
              <span className="text-[7px] font-bold">Edytuj</span>
            </button>
            {tabs.slice(0, 4).map(t => (
              <button key={t.id}
                onClick={() => { setActiveTab(t.id); setSidebarOpen(true); }}
                className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-gray-600 hover:text-gray-400 transition-colors active:scale-95">
                <span className="text-[11px]">{t.icon}</span>
                <span className="text-[7px] font-bold">{t.mobileLabel}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Notifications */}
      <Notifications notifications={notifications} onDismiss={dismiss} />

      {/* Modals */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      <CodeModal open={showCode} onClose={() => setShowCode(false)} code={codeContent} />
      <OutlookHelpModal open={showOutlookHelp} onClose={() => setShowOutlookHelp(false)} />
      <TemplatesModal open={showTemplates} onClose={() => setShowTemplates(false)}
        loadState={(data) => update(data)} notify={notify} />
    </div>
  );
}
