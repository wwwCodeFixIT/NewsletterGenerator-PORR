export interface Article {
  id: number;
  /** Polish title shown as the primary headline. */
  title: string;
  /** Optional English title shown below the Polish title. */
  titleEn?: string;
  description: string;
  image: string;
  /** Polish/news source URL used by the PL CTA button. */
  link: string;
  /** Optional English version URL. When set, newsletter renders an extra "Read more" button. */
  linkEn?: string;
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
  /** Polish title for the main article. */
  mainTitle: string;
  /** Optional English title for the main article. */
  mainTitleEn?: string;
  mainDescription: string;
  mainImage: string;
  mainLink: string;
  /** Optional English version URL for the main article. */
  mainLinkEn?: string;

  // Video
  videoThumbnail: string;
  videoLink: string;
  /** Polish title for the video/news block. */
  videoTitle: string;
  /** Optional English title for the video/news block. */
  videoTitleEn?: string;
  videoDescription: string;
  videoReadMore: string;
  /** Optional English version URL for the video/news CTA. */
  videoReadMoreEn?: string;

  // Footer
  footerTitle: string;
  footerLeft: string;
  footerRight: string;
  /** Footer CTA button text. Defaults to "Napisz do nas ✉️" for older saved projects. */
  footerButtonText: string;
  /** Footer CTA href. Defaults to mailto:contactEmail for older saved projects. */
  footerButtonUrl: string;
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
