import { useState, useCallback, useRef, useEffect } from 'react';
import type { NewsletterState, FeedbackStyle, ProjectData } from '@/types';

const defaultState: NewsletterState = {
  issueNumber: 'Espinacz nr 4/2026',
  preheader: '',
  logoUrl: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/_porr_rgb_screenpng.png',
  mainTitle: 'Wiecha w górę na budynku serwerowni FRA32',
  mainDescription: 'Nasze zespoły PORR Polska i PORR Niemcy pracujące ramię w ramię przy budowie centrum danych FRA32 w podfrankfurckim Raunheim osiągnęły właśnie kolejny kamień milowy!',
  mainImage: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/linkedin_29.jpg',
  mainLink: 'https://porrtal.porr-group.com',
  videoThumbnail: 'https://eyifvsv.stripocdn.email/content/guids/videoImgGuid/images/image1769786788858299.jpeg',
  videoLink: 'https://youtu.be/Ivbd9yoec3k',
  videoTitle: 'Modernizacja LK131 LOT A dobiegła końca',
  videoDescription: 'Ten największy w naszej historii kontrakt kolejowy trafił w ręce najlepszej Drużyny.',
  videoReadMore: 'https://porrtal.porr-group.com',
  footerTitle: 'Cieszymy się, że nas czytasz!',
  footerLeft: 'Espinacz to nasz tygodniowy newsletter firmowy.',
  footerRight: 'Masz pomysł lub uwagi? Napisz do nas!',
  contactEmail: 'komunikacja@porr.pl',
  facebookUrl: 'https://www.facebook.com/PorrSA',
  linkedinUrl: 'https://www.linkedin.com/company/28978817/',
  youtubeUrl: 'http://www.youtube.com/@PORR_Polska',
  primaryColor: '#143e70',
  accentColor: '#feed01',
  buttonTextColor: '#143e70',
  textColor: '#143e70',
  bgColor: '#fafafa',
  fontFamily: "'trebuchet ms', tahoma, sans-serif",
  showVideo: true,
  showSocial: true,
  showViewOnline: true,
  showFeedback: true,
  feedbackTitle: 'Jak oceniasz ten newsletter?',
  feedbackSubtitle: 'Twoja opinia pomoże nam tworzyć lepsze treści!',
  feedbackBgColor: '#f0f4f8',
  feedbackSurveyLink: '',
  feedbackSurveyText: 'Wypełnij pełną ankietę',
  feedbackStyle: 'emoji',
  feedbackOptions: [
    { id: 1, emoji: '😍', label: 'Świetny!', link: '#' },
    { id: 2, emoji: '😊', label: 'Dobry', link: '#' },
    { id: 3, emoji: '😐', label: 'OK', link: '#' },
    { id: 4, emoji: '😕', label: 'Słaby', link: '#' },
    { id: 5, emoji: '😞', label: 'Zły', link: '#' },
  ],
  articles: [
    { id: 1, title: 'Kolejny raz gramy z WOŚP', description: 'Nasza aukcja już śmiga na Allegro! Można wylicytować wizytę na placu budowy.', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image.png', link: 'https://porrtal.porr-group.com' },
    { id: 2, title: 'Na S19 zima nas nie zatrzyma!', description: 'Oddaliśmy do ruchu 9,3-km odcinek ekspresowej S19 👏', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image.jpeg', link: 'https://porrtal.porr-group.com' },
    { id: 3, title: 'Infrastruktura dla lotniska w Łasku', description: 'Misja trudna, ale daliśmy radę 💪', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image_SYG.jpeg', link: 'https://porrtal.porr-group.com' },
    { id: 4, title: 'Young Energy Europe', description: 'Rozwijamy zielone kompetencje!', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image_50O.png', link: 'https://porrtal.porr-group.com' },
  ],
  currentArticleId: null,
  nextId: 5,
  nextFeedbackId: 6,
};

const STORAGE_KEY = 'porr_newsletter_current';
const RECENT_KEY = 'porr_newsletter_recent';

function loadInitialState(): NewsletterState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<NewsletterState>;
      return { ...defaultState, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load state:', err);
  }
  return JSON.parse(JSON.stringify(defaultState)) as NewsletterState;
}

export function useNewsletterStore() {
  const [state, setState] = useState<NewsletterState>(loadInitialState);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = useCallback((partial: Partial<NewsletterState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const updateField = useCallback(<K extends keyof NewsletterState>(key: K, value: NewsletterState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Auto-save effect
  useEffect(() => {
    setSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        // Update recent projects
        let recent: ProjectData[] = [];
        try {
          recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        } catch (_parseErr) {
          recent = [];
        }
        const entry: ProjectData = {
          name: state.issueNumber || 'Bez nazwy',
          date: new Date().toISOString(),
          state,
        };
        const filtered = recent.filter(r => r.name !== entry.name);
        filtered.unshift(entry);
        localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 5)));
        setSaveStatus('saved');
      } catch (saveErr) {
        console.error('Save failed:', saveErr);
      }
    }, 800);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [state]);

  const loadState = useCallback((newState: NewsletterState) => {
    setState({ ...defaultState, ...newState });
  }, []);

  const resetState = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(defaultState)) as NewsletterState;
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addArticle = useCallback(() => {
    setState(prev => {
      const newArticle = {
        id: prev.nextId,
        title: 'Nowy artykuł',
        description: 'Opis artykułu...',
        image: 'https://via.placeholder.com/270x180/143e70/feed01?text=Nowy',
        link: '#',
      };
      return {
        ...prev,
        articles: [...prev.articles, newArticle],
        nextId: prev.nextId + 1,
        currentArticleId: newArticle.id,
      };
    });
  }, []);

  const removeArticle = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.filter(a => a.id !== id),
      currentArticleId: prev.currentArticleId === id ? null : prev.currentArticleId,
    }));
  }, []);

  const updateArticle = useCallback((id: number, data: Partial<{ title: string; description: string; image: string; link: string }>) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === id ? { ...a, ...data } : a),
    }));
  }, []);

  const moveArticle = useCallback((id: number, direction: -1 | 1) => {
    setState(prev => {
      const idx = prev.articles.findIndex(a => a.id === id);
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.articles.length) return prev;
      const newArticles = [...prev.articles];
      [newArticles[idx], newArticles[newIdx]] = [newArticles[newIdx], newArticles[idx]];
      return { ...prev, articles: newArticles };
    });
  }, []);

  const setFeedbackStyle = useCallback((style: FeedbackStyle) => {
    const defaults: Record<FeedbackStyle, string[]> = {
      emoji: ['😍', '😊', '😐', '😕', '😞'],
      stars: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'],
      thumbs: ['👍👍', '👍', '🤷', '👎', '👎👎'],
    };
    setState(prev => ({
      ...prev,
      feedbackStyle: style,
      feedbackOptions: prev.feedbackOptions.map((o, i) => ({
        ...o,
        emoji: defaults[style][i] || o.emoji,
      })),
    }));
  }, []);

  const addFeedbackOption = useCallback(() => {
    setState(prev => {
      if (prev.feedbackOptions.length >= 7) return prev;
      return {
        ...prev,
        feedbackOptions: [...prev.feedbackOptions, { id: prev.nextFeedbackId, emoji: '🙂', label: 'Nowa', link: '#' }],
        nextFeedbackId: prev.nextFeedbackId + 1,
      };
    });
  }, []);

  const removeFeedbackOption = useCallback((id: number) => {
    setState(prev => {
      if (prev.feedbackOptions.length <= 2) return prev;
      return { ...prev, feedbackOptions: prev.feedbackOptions.filter(o => o.id !== id) };
    });
  }, []);

  const updateFeedbackOption = useCallback((id: number, data: Partial<{ emoji: string; label: string; link: string }>) => {
    setState(prev => ({
      ...prev,
      feedbackOptions: prev.feedbackOptions.map(o => o.id === id ? { ...o, ...data } : o),
    }));
  }, []);

  const getRecentProjects = useCallback((): ProjectData[] => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch (_err) {
      return [];
    }
  }, []);

  return {
    state,
    saveStatus,
    update,
    updateField,
    loadState,
    resetState,
    addArticle,
    removeArticle,
    updateArticle,
    moveArticle,
    setFeedbackStyle,
    addFeedbackOption,
    removeFeedbackOption,
    updateFeedbackOption,
    getRecentProjects,
  };
}
