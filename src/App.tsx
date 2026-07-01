import { useState, useEffect, useCallback } from 'react';
import { useNewsletterStore } from '@/hooks/useNewsletterStore';
import { useNotification } from '@/hooks/useNotification';
import { generateEmailHTML } from '@/utils/emailGenerator';
import { generateNewOutlookPasteHTML, getNewOutlookPasteWarnings } from '@/utils/newOutlookPaste';
import { generateEml } from '@/utils/emlGenerator';
import { copyHtmlToClipboard, copyPlainHtmlSource } from '@/utils/clipboard';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { Preview } from '@/components/Preview';
import { Notifications } from '@/components/Notifications';
import { HelpModal } from '@/components/Modals/HelpModal';
import { CodeModal } from '@/components/Modals/CodeModal';
import { TemplatesModal } from '@/components/Modals/TemplatesModal';
import { OutlookHelpModal } from '@/components/Modals/OutlookHelpModal';
import { LibraryModal } from '@/components/Modals/LibraryModal';
import { SaveToLibraryModal } from '@/components/Modals/SaveToLibraryModal';
import type { TabId, DeviceType } from '@/types';

function downloadFile(content: string, filename: string, type: string, addBom = false) {
  const blob = new Blob([addBom ? '\uFEFF' + content : content], { type });
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
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSaveToLibrary, setShowSaveToLibrary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const html = generateEmailHTML(store.state);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const handleExportHTML = useCallback(() => {
  downloadFile(html, 'newsletter.html', 'text/html;charset=utf-8', true);
  notify('✅ HTML pobrany!');
}, [html, notify]);

  const handleExportEML = useCallback(() => {
    const eml = generateEml(html, store.state, { draftMode: false });
    downloadFile(eml, 'newsletter.eml', 'message/rfc822');
    notify('📧 EML pobrany! Otwórz/importuj w nowym Outlooku. Do edycji najstabilniej użyj kopiowania treści do nowej wiadomości.', 'info');
  }, [html, store.state, notify]);

  const handleExportEMLDraft = useCallback(() => {
    const eml = generateEml(html, store.state, { draftMode: true });
    downloadFile(eml, 'newsletter-draft.eml', 'message/rfc822');
    notify('📧 EML draft pobrany! Otwórz w klasycznym Outlooku i edytuj przed wysyłką.', 'info');
  }, [html, store.state, notify]);

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
    copyPlainHtmlSource(html)
      .then(() => notify('📋 Kod HTML skopiowany do schowka!'))
      .catch(() => notify('❌ Nie udało się skopiować HTML. Sprawdź uprawnienia schowka.', 'error'));
  }, [html, notify]);

  const handleCopyForNewOutlook = useCallback(() => {
    const pasteHtml = generateNewOutlookPasteHTML(store.state);
    const warnings = getNewOutlookPasteWarnings(store.state);

    copyHtmlToClipboard(pasteHtml)
      .then(() => {
        if (warnings.length > 0) {
          notify(`📋 Skopiowano treść maila. Uwaga: ${warnings[0]}`, 'warning');
          return;
        }

        notify('📋 Skopiowano treść maila. W nowym Outlooku utwórz nową wiadomość i wklej Ctrl+V.', 'info');
      })
      .catch(() => notify('❌ Nie udało się skopiować treści HTML dla Outlooka.', 'error'));
  }, [store.state, notify]);

  const handleCopyAsSignature = useCallback(() => {
    const pasteHtml = generateNewOutlookPasteHTML(store.state);

    copyHtmlToClipboard(pasteHtml)
      .then(() => notify('✍️ Skopiowano uproszczoną treść HTML. Wklej w ustawieniach podpisu Outlooka.', 'info'))
      .catch(() => notify('❌ Nie udało się skopiować podpisu.', 'error'));
  }, [store.state, notify]);

  const handleOpenInNewTab = useCallback(() => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [html]);

  const handleSaveProject = useCallback(() => {
  try {
    localStorage.setItem('porr_newsletter_current', JSON.stringify(store.state));
    notify('💾 Projekt zapisany lokalnie!');
  } catch {
    notify('❌ Nie udało się zapisać projektu lokalnie.', 'error');
  }
}, [notify, store.state]);

  const handleSaveProjectToFile = useCallback(() => {
    const data = JSON.stringify(store.state, null, 2);
    downloadFile(
      data,
      `newsletter-${store.state.issueNumber.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'projekt'}.json`,
      'application/json',
      true
    );
    notify('📦 Projekt wyeksportowany do pliku!');
  }, [store.state, notify]);

  const handleLoadProjectFromFile = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data || typeof data !== 'object') {
          throw new Error('invalid');
        }

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
    if (type === 'default') {
      store.resetState();
    } else if (type === 'empty') {
      store.update({
        articles: [],
        currentArticleId: null,
        showVideo: false,
        showFeedback: false,
        mainTitleEn: '',
        mainLinkEn: '',
        videoTitleEn: '',
        videoReadMoreEn: '',
      });
    } else if (type === 'minimal') {
      store.update({
        articles: store.state.articles.slice(0, 2).map((article) => ({ ...article, titleEn: article.titleEn || '', linkEn: article.linkEn || '' })),
        showVideo: false,
        showFeedback: false,
      });
    } else if (type === 'event') {
      store.update({
        issueNumber: 'Zaproszenie na wydarzenie',
        mainTitle: 'Zapraszamy na event firmowy!',
        mainTitleEn: '',
        mainDescription: 'Dołącz do nas na niezapomnianym wydarzeniu. Szczegóły wewnątrz!',
        mainLinkEn: '',
        articles: [],
        showVideo: false,
        videoTitleEn: '',
        videoReadMoreEn: '',
        currentArticleId: null,
      });
    } else if (type === 'kdp-lodz') {
      const plUrl = 'https://porrtal.porr-group.com/_/g3-poland/pl-pl/country-news/testowe-obcienia-suwnicy';
      const enUrl = 'https://porrtal.porr-group.com/_/g3-poland/en-us/country-news/testowe-obcienia-suwnicy';

      store.update({
        issueNumber: 'Tunnel connects us: Newsletter KDP Łódź nr 1/2026',
        preheader: 'Tunnel connects us — najnowsze informacje z projektu KDP Łódź.',
        mainTitle: 'Testowe obciążenia suwnicy',
        mainTitleEn: 'Crane test loads',
        mainDescription: 'Sprawdź najnowszy news z projektu KDP Łódź w polskiej lub angielskiej wersji językowej.',
        mainLink: plUrl,
        mainLinkEn: enUrl,
        showVideo: false,
        videoTitleEn: '',
        videoReadMoreEn: '',
        showFeedback: true,
        currentArticleId: 1,
        articles: [
          {
            id: 1,
            title: 'Testowe obciążenia suwnicy',
            titleEn: 'Crane test loads',
            description: 'News dostępny w dwóch wersjach językowych — PL i EN.',
            image: store.state.mainImage,
            link: plUrl,
            linkEn: enUrl,
          },
          {
            id: 2,
            title: 'Kolejny news z projektu KDP Łódź',
            titleEn: 'Next news from the KDP Łódź project',
            description: 'Uzupełnij treść, obraz oraz linki PL/EN dla kolejnej aktualności.',
            image: 'https://via.placeholder.com/270x180/143e70/feed01?text=KDP+Lodz',
            link: '#',
            linkEn: '',
          },
        ],
        nextId: 3,
      });
    }

    setShowTemplates(false);
    notify('📋 Szablon wczytany!');
  }, [store, notify]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSaveProject();
            break;
          case 'e':
            e.preventDefault();
            handleExportHTML();
            break;
          case 'p':
            e.preventDefault();
            handleOpenInNewTab();
            break;
          case 'n':
            e.preventDefault();
            handleNewProject();
            break;
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
      tablet: 768,
      desktop: 1024,
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
          onShowLibrary={() => setShowLibrary(true)}
          onShowSaveToLibrary={() => setShowSaveToLibrary(true)}
          onLoadProjectFromFile={handleLoadProjectFromFile}
          onExportHTML={handleExportHTML}
          onExportEML={handleExportEML}
          onExportEMLDraft={handleExportEMLDraft}
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
      {showLibrary && (
        <LibraryModal
          onClose={() => setShowLibrary(false)}
          onLoad={store.loadState}
          notify={notify}
        />
      )}
      {showSaveToLibrary && (
        <SaveToLibraryModal
          state={store.state}
          onClose={() => setShowSaveToLibrary(false)}
          notify={notify}
        />
      )}
    </div>
  );
}
