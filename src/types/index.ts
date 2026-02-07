export interface Article {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface FeedbackOption {
  id: number;
  emoji: string;
  label: string;
  link: string;
}

export type FeedbackStyle = 'emoji' | 'stars' | 'thumbs';

export interface NewsletterState {
  // Header
  issueNumber: string;
  preheader: string;
  logoUrl: string;

  // Main article
  mainTitle: string;
  mainDescription: string;
  mainImage: string;
  mainLink: string;

  // Video
  videoThumbnail: string;
  videoLink: string;
  videoTitle: string;
  videoDescription: string;
  videoReadMore: string;

  // Footer
  footerTitle: string;
  footerLeft: string;
  footerRight: string;
  contactEmail: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;

  // Style
  primaryColor: string;
  accentColor: string;
  buttonTextColor: string;
  textColor: string;
  bgColor: string;
  fontFamily: string;

  // Toggles
  showVideo: boolean;
  showSocial: boolean;
  showViewOnline: boolean;
  showFeedback: boolean;

  // Feedback
  feedbackTitle: string;
  feedbackSubtitle: string;
  feedbackBgColor: string;
  feedbackSurveyLink: string;
  feedbackSurveyText: string;
  feedbackStyle: FeedbackStyle;
  feedbackOptions: FeedbackOption[];

  // Articles
  articles: Article[];

  // Internal
  currentArticleId: number | null;
  nextId: number;
  nextFeedbackId: number;
}

export interface ProjectData {
  name: string;
  date: string;
  state: NewsletterState;
}

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export type TabId = 'content' | 'articles' | 'feedback' | 'style' | 'export';

export type DeviceType = 'mobile-sm' | 'mobile-lg' | 'tablet' | 'desktop';

export interface DeviceConfig {
  width: number;
  type: 'mobile' | 'tablet' | 'desktop';
  label: string;
  icon: string;
  size: string;
}
