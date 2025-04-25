import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin user schema
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
});

// Announcements schema
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  featured: boolean("featured").default(false),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  featured: true,
});

// Stream settings schema
export const streamSettings = pgTable("stream_settings", {
  id: serial("id").primaryKey(),
  featuredChannel: text("featured_channel").notNull(),
  autoDetect: boolean("auto_detect").default(true),
  offlineBehavior: text("offline_behavior").notNull().default("message"),
});

export const insertStreamSettingsSchema = createInsertSchema(streamSettings).pick({
  featuredChannel: true,
  autoDetect: true,
  offlineBehavior: true,
});

// Stream channels schema
export const streamChannels = pgTable("stream_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  displayName: text("display_name").notNull(),
  type: text("type").notNull(), // IRL, Gaming, etc.
  schedule: text("schedule"),
  isMain: boolean("is_main").default(false),
});

export const insertStreamChannelSchema = createInsertSchema(streamChannels).pick({
  name: true,
  url: true,
  displayName: true,
  type: true,
  schedule: true,
  isMain: true,
});

// Theme settings schema
export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  accentColor: text("accent_color").notNull(),
  textColor: text("text_color").notNull(),
  backgroundType: text("background_type").notNull(),
  backgroundValue: text("background_value").notNull(), // url, color, etc.
  headingFont: text("heading_font").notNull(),
  bodyFont: text("body_font").notNull(),
  isActive: boolean("is_active").default(false),
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettings).pick({
  name: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  textColor: true,
  backgroundType: true,
  backgroundValue: true,
  headingFont: true,
  bodyFont: true,
  isActive: true,
});

// Activity logs schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  details: text("details"),
  adminId: integer("admin_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  category: text("category").notNull(), // theme, announcement, stream, etc.
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  action: true,
  details: true,
  adminId: true,
  category: true,
});

// Type definitions
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type StreamSetting = typeof streamSettings.$inferSelect;
export type InsertStreamSetting = z.infer<typeof insertStreamSettingsSchema>;

export type StreamChannel = typeof streamChannels.$inferSelect;
export type InsertStreamChannel = z.infer<typeof insertStreamChannelSchema>;

export type ThemeSetting = typeof themeSettings.$inferSelect;
export type InsertThemeSetting = z.infer<typeof insertThemeSettingsSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
