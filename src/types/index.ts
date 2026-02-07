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
  issueNumber: string;
  preheader: string;
  logoUrl: string;

  mainTitle: string;
  mainDescription: string;
  mainImage: string;
  mainLink: string;

  videoThumbnail: string;
  videoLink: string;
  videoTitle: string;
  videoDescription: string;
  videoReadMore: string;

  footerTitle: string;
  footerLeft: string;
  footerRight: string;
  contactEmail: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;

  primaryColor: string;
  accentColor: string;
  buttonTextColor: string;
  textColor: string;
  bgColor: string;
  fontFamily: string;

  showVideo: boolean;
  showSocial: boolean;
  showViewOnline: boolean;
  showFeedback: boolean;

  feedbackTitle: string;
  feedbackSubtitle: string;
  feedbackBgColor: string;
  feedbackSurveyLink: string;
  feedbackSurveyText: string;
  feedbackStyle: FeedbackStyle;
  feedbackOptions: FeedbackOption[];
  nextFeedbackId: number;

  articles: Article[];
  currentArticleId: number | null;
  nextArticleId: number;

  projectName: string;
}

export interface RecentProject {
  name: string;
  date: string;
  data: NewsletterState;
}

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export type TabId = 'content' | 'articles' | 'feedback' | 'style' | 'export';

export type DeviceType = 'mobile-sm' | 'mobile-lg' | 'tablet' | 'desktop';

export interface DeviceInfo {
  width: number;
  type: 'mobile' | 'tablet' | 'desktop';
  label: string;
}
