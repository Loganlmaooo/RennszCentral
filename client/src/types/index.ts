// Announcement types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: Date | string;
  featured: boolean;
}

export interface InsertAnnouncement {
  title: string;
  content: string;
  featured: boolean;
}

// Stream settings types
export interface StreamSetting {
  id: number;
  featuredChannel: string;
  autoDetect: boolean;
  offlineBehavior: string;
}

export interface InsertStreamSetting {
  featuredChannel: string;
  autoDetect: boolean;
  offlineBehavior: string;
}

// Stream channel types
export interface StreamChannel {
  id: number;
  name: string;
  url: string;
  displayName: string;
  type: string;
  schedule?: string;
  isMain: boolean;
}

export interface InsertStreamChannel {
  name: string;
  url: string;
  displayName: string;
  type: string;
  schedule?: string;
  isMain: boolean;
}

// Theme settings types
export interface ThemeSetting {
  id: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundType: string;
  backgroundValue: string;
  headingFont: string;
  bodyFont: string;
  isActive: boolean;
}

export interface InsertThemeSetting {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundType: string;
  backgroundValue: string;
  headingFont: string;
  bodyFont: string;
  isActive: boolean;
}

// Activity log types
export interface ActivityLog {
  id: number;
  action: string;
  details?: string;
  adminId?: number;
  timestamp: Date | string;
  category: string;
}

export interface InsertActivityLog {
  action: string;
  details?: string;
  adminId?: number;
  category: string;
}
