import { useState, useCallback, useRef, useEffect } from 'react';
import type { NewsletterState, FeedbackStyle, RecentProject } from '@/types';

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
  nextFeedbackId: 6,

  articles: [
    { id: 1, title: 'Kolejny raz gramy z WOŚP', description: 'Nasza aukcja już śmiga na Allegro! Można wylicytować wizytę na placu budowy.', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image.png', link: 'https://porrtal.porr-group.com' },
    { id: 2, title: 'Na S19 zima nas nie zatrzyma!', description: 'Oddaliśmy do ruchu 9,3-km odcinek ekspresowej S19 👏', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image.jpeg', link: 'https://porrtal.porr-group.com' },
    { id: 3, title: 'Infrastruktura dla lotniska w Łasku', description: 'Misja trudna, ale daliśmy radę 💪', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image_SYG.jpeg', link: 'https://porrtal.porr-group.com' },
    { id: 4, title: 'Young Energy Europe', description: 'Rozwijamy zielone kompetencje!', image: 'https://eyifvsv.stripocdn.email/content/guids/CABINET_ca0715bd41167d78d8998eff7cc81b8d6196f4289576108dfc827ce6ec8fc9fa/images/image_50O.png', link: 'https://porrtal.porr-group.com' },
  ],
  currentArticleId: null,
  nextArticleId: 5,

  projectName: 'Nowy projekt',
};

export function useNewsletterStore() {
  const [state, setState] = useState<NewsletterState>(() => {
    try {
      const saved = localStorage.getItem('newsletter_current');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return defaultState;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((partial: Partial<NewsletterState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // Auto-save effect
  useEffect(() => {
    setSaveStatus('saving');
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem('newsletter_current', JSON.stringify(state));
        // Update recent projects
        const recent: RecentProject[] = JSON.parse(localStorage.getItem('newsletter_recent') || '[]');
        const entry: RecentProject = {
          name: state.issueNumber || 'Bez nazwy',
          date: new Date().toISOString(),
          data: state,
        };
        const filtered = recent.filter(r => r.name !== entry.name);
        filtered.unshift(entry);
        localStorage.setItem('newsletter_recent', JSON.stringify(filtered.slice(0, 5)));
        setSaveStatus('saved');
      } catch (e) {
        console.error('Error saving:', e);
      }
    }, 1000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [state]);

  const addArticle = useCallback(() => {
    setState(prev => {
      const newArticle = {
        id: prev.nextArticleId,
        title: 'Nowy artykuł',
        description: 'Opis...',
        image: 'https://via.placeholder.com/270x180/143e70/feed01?text=Nowy',
        link: '#',
      };
      return {
        ...prev,
        articles: [...prev.articles, newArticle],
        currentArticleId: newArticle.id,
        nextArticleId: prev.nextArticleId + 1,
      };
    });
  }, []);

  const deleteArticle = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.filter(a => a.id !== id),
      currentArticleId: prev.currentArticleId === id ? null : prev.currentArticleId,
    }));
  }, []);

  const moveArticle = useCallback((id: number, dir: -1 | 1) => {
    setState(prev => {
      const idx = prev.articles.findIndex(a => a.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.articles.length) return prev;
      const newArticles = [...prev.articles];
      [newArticles[idx], newArticles[newIdx]] = [newArticles[newIdx], newArticles[idx]];
      return { ...prev, articles: newArticles };
    });
  }, []);

  const updateArticle = useCallback((id: number, partial: Partial<NewsletterState['articles'][0]>) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === id ? { ...a, ...partial } : a),
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

  const deleteFeedbackOption = useCallback((id: number) => {
    setState(prev => {
      if (prev.feedbackOptions.length <= 2) return prev;
      return { ...prev, feedbackOptions: prev.feedbackOptions.filter(o => o.id !== id) };
    });
  }, []);

  const updateFeedbackOption = useCallback((id: number, partial: Partial<NewsletterState['feedbackOptions'][0]>) => {
    setState(prev => ({
      ...prev,
      feedbackOptions: prev.feedbackOptions.map(o => o.id === id ? { ...o, ...partial } : o),
    }));
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

  const resetProject = useCallback(() => {
    localStorage.removeItem('newsletter_current');
    setState(defaultState);
  }, []);

  const loadState = useCallback((data: NewsletterState) => {
    setState(data);
  }, []);

  const getRecentProjects = useCallback((): RecentProject[] => {
    try {
      return JSON.parse(localStorage.getItem('newsletter_recent') || '[]');
    } catch {
      return [];
    }
  }, []);

  return {
    state,
    update,
    saveStatus,
    addArticle,
    deleteArticle,
    moveArticle,
    updateArticle,
    addFeedbackOption,
    deleteFeedbackOption,
    updateFeedbackOption,
    setFeedbackStyle,
    resetProject,
    loadState,
    getRecentProjects,
  };
}
