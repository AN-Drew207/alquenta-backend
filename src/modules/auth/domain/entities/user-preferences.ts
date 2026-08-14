export interface NotificationPrefs {
  newMessage: boolean;
  threadReply: boolean;
  unanswered: boolean;
  weeklyDigest: boolean;
  listingExpiring: boolean;
  product: boolean;
  channels: {
    email: boolean;
    inApp: boolean;
    whatsapp: boolean;
  };
  quietFrom: string;
  quietTo: string;
}

export interface PrivacyPrefs {
  publicProfile: boolean;
  showLocation: boolean;
  showLastSeen: boolean;
  showResponseTime: boolean;
  whoCanMessage: 'ANYONE' | 'VERIFIED_EMAIL' | 'FULLY_VERIFIED';
  filterSpam: boolean;
}

export interface GeneralPrefs {
  locale: 'es' | 'en' | 'pt';
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newMessage: true,
  threadReply: true,
  unanswered: true,
  weeklyDigest: true,
  listingExpiring: true,
  product: false,
  channels: { email: true, inApp: true, whatsapp: false },
  quietFrom: '22:00',
  quietTo: '07:00',
};

export const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  publicProfile: true,
  showLocation: true,
  showLastSeen: true,
  showResponseTime: true,
  whoCanMessage: 'ANYONE',
  filterSpam: true,
};

export const DEFAULT_GENERAL_PREFS: GeneralPrefs = {
  locale: 'es',
  theme: 'system',
};
