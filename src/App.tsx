import { useState, useEffect, useCallback } from 'react';
import { useNewsletterStore } from '@/hooks/useNewsletterStore';
import { useNotification } from '@/hooks/useNotification';
import { generateEmailHTML } from '@/utils/emailGenerator';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { Preview } from '@/components/Preview';
import { Notifications } from '@/components/Notifications';
import { HelpModal } from '@/components/Modals/HelpModal';
import { CodeModal } from '@/components/Modals/CodeModal';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import { OutlookHelpModal } from '@/components/Modals/OutlookHelpModal';
import type { TabId, DeviceType } from '@/types';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob(['\uFEFF' + content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export function App() {
  const store = useNewsletterStore();
  const { notifications, show: notify, dismiss } = useNotification();
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [previewWidth, setPreviewWidth] = useState(1024);
  const [showHelp, setShowHelp] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showOutlookHelp, setShowOutlookHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const html = generateEmailHTML(store.state);

  // Close sidebar on tab change (mobile)
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const handleExportHTML = useCallback(() => {
    downloadFile(html, 'newsletter.html', 'text/html;charset=utf-8');
    notify('✅ HTML pobrany!');
  }, [html, notify]);

  const handleExportEML = useCallback(() => {
    const subject = store.state.issueNumber;
    const boundary = '----=_Part_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    const eml = [
      'From: newsletter@porr.pl',
      'To: recipient@example.com',
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      'X-Mailer: PORR Newsletter Generator v3.0',
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="utf-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      html,
      '',
      `--${boundary}--`,
    ].join('\r\n');
    downloadFile(eml, 'newsletter.eml', 'message/rfc822');
    notify('📧 EML pobrany! Otwórz w Outlook → Zapisz jako .OFT', 'info');
  }, [html, store.state.issueNumber, notify]);

  const handleExportMHT = useCallback(() => {
    const boundary = '----=_NextPart_' + Date.now();
    const mht = [
      'From: <PORR Newsletter Generator>',
      `Subject: ${store.state.issueNumber}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/related; boundary="${boundary}"; type="text/html"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="utf-8"',
      'Content-Transfer-Encoding: 8bit',
      'Content-Location: file:///newsletter.html',
      '',
      html,
      '',
      `--${boundary}--`,
    ].join('\r\n');
    downloadFile(mht, 'newsletter.mht', 'message/rfc822');
    notify('📄 MHT pobrany!');
  }, [html, store.state.issueNumber, notify]);

  const handleCopyHTML = useCallback(() => {
    navigator.clipboard.writeText(html).then(() => notify('📋 HTML skopiowany do schowka!'));
  }, [html, notify]);

  const handleCopyForNewOutlook = useCallback(() => {
    navigator.clipboard.writeText(html).then(() => notify('📋 Skopiowano! Wklej do "Moje szablony" w Outlook', 'info'));
  }, [html, notify]);

  const handleCopyAsSignature = useCallback(() => {
    navigator.clipboard.writeText(html).then(() => notify('✍️ Skopiowano! Wklej jako nowy podpis w ustawieniach', 'info'));
  }, [html, notify]);

  const handleOpenInNewTab = useCallback(() => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank');
  }, [html]);

  const handleSaveProject = useCallback(() => {
    notify('💾 Projekt zapisany lokalnie!');
  }, [notify]);

  const handleSaveProjectToFile = useCallback(() => {
    const data = JSON.stringify(store.state, null, 2);
    downloadFile(data, `newsletter-${store.state.issueNumber.replace(/\s+/g, '-')}.json`, 'application/json');
    notify('📦 Projekt wyeksportowany do pliku!');
  }, [store.state, notify]);

  const handleLoadProjectFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        store.loadState(data);
        notify('✅ Projekt wczytany pomyślnie!');
      } catch {
        notify('❌ Błąd wczytywania pliku! Sprawdź format.', 'error');
      }
    };
    reader.readAsText(file);
  }, [store, notify]);

  const handleNewProject = useCallback(() => {
    if (confirm('Utworzyć nowy projekt?\nNiezapisane zmiany zostaną utracone.')) {
      store.resetState();
      notify('📄 Nowy projekt utworzony!');
    }
  }, [store, notify]);

  const handleLoadTemplate = useCallback((type: string) => {
    if (type === 'empty') {
      store.update({ articles: [], currentArticleId: null, showVideo: false, showFeedback: false });
    } else if (type === 'minimal') {
      store.update({
        articles: store.state.articles.slice(0, 2),
        showVideo: false,
        showFeedback: false,
      });
    } else if (type === 'event') {
      store.update({
        issueNumber: 'Zaproszenie na wydarzenie',
        mainTitle: 'Zapraszamy na event firmowy!',
        mainDescription: 'Dołącz do nas na niezapomnianym wydarzeniu. Szczegóły wewnątrz!',
        articles: [],
        showVideo: false,
        currentArticleId: null,
      });
    }
    // 'default' keeps current state
    setShowTemplates(false);
    notify('📋 Szablon wczytany!');
  }, [store, notify]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's': e.preventDefault(); handleSaveProject(); break;
          case 'e': e.preventDefault(); handleExportHTML(); break;
          case 'p': e.preventDefault(); handleOpenInNewTab(); break;
          case 'n': e.preventDefault(); handleNewProject(); break;
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSaveProject, handleExportHTML, handleOpenInNewTab, handleNewProject]);

  const handleDeviceChange = useCallback((device: DeviceType) => {
    setActiveDevice(device);
    const widths: Record<DeviceType, number> = {
      'mobile-sm': 375,
      'mobile-lg': 430,
      'tablet': 768,
      'desktop': 1024,
    };
    setPreviewWidth(widths[device]);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#1a1a2e] text-white">
      <TopBar
        saveStatus={store.saveStatus}
        onShowHelp={() => setShowHelp(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          store={store}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onShowTemplates={() => setShowTemplates(true)}
          onLoadProjectFromFile={handleLoadProjectFromFile}
          onExportHTML={handleExportHTML}
          onExportEML={handleExportEML}
          onExportMHT={handleExportMHT}
          onCopyHTML={handleCopyHTML}
          onCopyForNewOutlook={handleCopyForNewOutlook}
          onCopyAsSignature={handleCopyAsSignature}
          onShowCode={() => setShowCode(true)}
          onOpenInNewTab={handleOpenInNewTab}
          onSaveProjectToFile={handleSaveProjectToFile}
          onShowOutlookHelp={() => setShowOutlookHelp(true)}
          notify={notify}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Preview
          html={html}
          activeDevice={activeDevice}
          previewWidth={previewWidth}
          onDeviceChange={handleDeviceChange}
          onWidthChange={setPreviewWidth}
        />
      </div>

      <Notifications notifications={notifications} onDismiss={dismiss} />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showCode && <CodeModal html={html} onClose={() => setShowCode(false)} onCopy={handleCopyHTML} />}
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} onLoad={handleLoadTemplate} />}
      {showOutlookHelp && <OutlookHelpModal onClose={() => setShowOutlookHelp(false)} />}
    </div>
  );
}
