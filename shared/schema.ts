import { z } from "zod";

// Type definitions
export interface Admin {
  id: number;
  username: string;
  password: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: Date;
  featured: boolean;
}

export interface StreamSetting {
  id: number;
  featuredChannel: string;
  autoDetect: boolean;
  offlineBehavior: string;
}

export interface StreamChannel {
  id: number;
  name: string;
  url: string;
  displayName: string;
  type: string;
  schedule?: string;
  isMain: boolean;
}

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

export interface ActivityLog {
  id: number;
  action: string;
  details?: string;
  adminId?: number;
  timestamp: Date;
  category: string;
}

// Schema validation
export const insertAdminSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const insertAnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  featured: z.boolean().optional()
});

export const insertStreamSettingsSchema = z.object({
  featuredChannel: z.string(),
  autoDetect: z.boolean().optional(),
  offlineBehavior: z.string()
});

export const insertStreamChannelSchema = z.object({
  name: z.string(),
  url: z.string(),
  displayName: z.string(),
  type: z.string(),
  schedule: z.string().optional(),
  isMain: z.boolean().optional()
});

export const insertThemeSettingsSchema = z.object({
  name: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
  backgroundType: z.string(),
  backgroundValue: z.string(),
  headingFont: z.string(),
  bodyFont: z.string(),
  isActive: z.boolean().optional()
});

export const insertActivityLogSchema = z.object({
  action: z.string(),
  details: z.string().optional(),
  adminId: z.number().optional(),
  category: z.string()
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertStreamSetting = z.infer<typeof insertStreamSettingsSchema>;
export type InsertStreamChannel = z.infer<typeof insertStreamChannelSchema>;
export type InsertThemeSetting = z.infer<typeof insertThemeSettingsSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;