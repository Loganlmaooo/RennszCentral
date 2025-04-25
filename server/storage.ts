import {
  Admin,
  InsertAdmin,
  Announcement,
  InsertAnnouncement,
  StreamSetting,
  InsertStreamSetting,
  StreamChannel,
  InsertStreamChannel,
  ThemeSetting,
  InsertThemeSetting,
  ActivityLog,
  InsertActivityLog
} from "@shared/schema";

export interface IStorage {
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  
  // Announcement methods
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementById(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  getFeaturedAnnouncement(): Promise<Announcement | undefined>;
  setFeaturedAnnouncement(id: number): Promise<boolean>;
  
  // Stream settings methods
  getStreamSettings(): Promise<StreamSetting | undefined>;
  updateStreamSettings(settings: Partial<InsertStreamSetting>): Promise<StreamSetting>;
  
  // Stream channels methods
  getStreamChannels(): Promise<StreamChannel[]>;
  getStreamChannelById(id: number): Promise<StreamChannel | undefined>;
  createStreamChannel(channel: InsertStreamChannel): Promise<StreamChannel>;
  updateStreamChannel(id: number, channel: Partial<InsertStreamChannel>): Promise<StreamChannel | undefined>;
  deleteStreamChannel(id: number): Promise<boolean>;
  
  // Theme settings methods
  getThemeSettings(): Promise<ThemeSetting[]>;
  getActiveTheme(): Promise<ThemeSetting | undefined>;
  getThemeById(id: number): Promise<ThemeSetting | undefined>;
  createTheme(theme: InsertThemeSetting): Promise<ThemeSetting>;
  updateTheme(id: number, theme: Partial<InsertThemeSetting>): Promise<ThemeSetting | undefined>;
  deleteTheme(id: number): Promise<boolean>;
  setActiveTheme(id: number): Promise<boolean>;
  
  // Activity logs methods
  getLogs(): Promise<ActivityLog[]>;
  createLog(log: InsertActivityLog): Promise<ActivityLog>;
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private announcements: Map<number, Announcement>;
  private streamSettings: StreamSetting | undefined;
  private streamChannels: Map<number, StreamChannel>;
  private themeSettings: Map<number, ThemeSetting>;
  private activityLogs: Map<number, ActivityLog>;
  
  private adminCurrentId: number;
  private announcementCurrentId: number;
  private streamChannelCurrentId: number;
  private themeSettingCurrentId: number;
  private activityLogCurrentId: number;

  constructor() {
    this.admins = new Map();
    this.announcements = new Map();
    this.streamChannels = new Map();
    this.themeSettings = new Map();
    this.activityLogs = new Map();
    
    this.adminCurrentId = 1;
    this.announcementCurrentId = 1;
    this.streamChannelCurrentId = 1;
    this.themeSettingCurrentId = 1;
    this.activityLogCurrentId = 1;
    
    // Initialize with default data
    this.seedData();
  }
  
  private seedData() {
    // Add default admin
    this.admins.set(1, {
      id: 1,
      username: "admin",
      password: "Rennsz5842" // In a real app, this would be hashed
    });
    
    // Add default stream settings
    this.streamSettings = {
      id: 1,
      featuredChannel: "rennsz",
      autoDetect: true,
      offlineBehavior: "message"
    };
    
    // Add default stream channels
    this.streamChannels.set(1, {
      id: 1,
      name: "rennsz",
      url: "https://www.twitch.tv/rennsz",
      displayName: "RENNSZ - IRL Adventures",
      type: "IRL",
      schedule: "Streams every Tue, Thu, Sat",
      isMain: true
    });
    
    this.streamChannels.set(2, {
      id: 2,
      name: "rennszino",
      url: "https://www.twitch.tv/rennszino",
      displayName: "RENNSZINO - Gaming & Chill",
      type: "Gaming",
      schedule: "Streams every Mon, Wed, Sun",
      isMain: false
    });
    
    // Add default theme
    this.themeSettings.set(1, {
      id: 1,
      name: "Premium Dark",
      primaryColor: "#111111",
      secondaryColor: "#222222",
      accentColor: "#D4AF37",
      textColor: "#FFFFFF",
      backgroundType: "image",
      backgroundValue: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866",
      headingFont: "Montserrat",
      bodyFont: "Poppins",
      isActive: true
    });
    
    // Add a Halloween theme preset
    this.themeSettings.set(2, {
      id: 2,
      name: "Halloween Theme",
      primaryColor: "#000000",
      secondaryColor: "#1a1a1a",
      accentColor: "#ff6600",
      textColor: "#FFFFFF",
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(90deg, #000000, #300000, #000000)",
      headingFont: "Montserrat",
      bodyFont: "Poppins",
      isActive: false
    });
    
    // Add sample announcements
    this.announcements.set(1, {
      id: 1,
      title: "Welcome to the Official RENNSZ Website",
      content: "Welcome to the official RENNSZ website! Join us for our weekly IRL stream this Saturday at 3PM EST where we'll be exploring downtown with some special guests!",
      date: new Date(),
      featured: true
    });
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }
  
  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementCurrentId++;
    const newAnnouncement: Announcement = {
      ...announcement,
      id,
      date: new Date()
    };
    
    // If this is set as featured, un-feature all others
    if (newAnnouncement.featured) {
      for (const [existingId, existingAnnouncement] of this.announcements.entries()) {
        if (existingAnnouncement.featured) {
          this.announcements.set(existingId, {
            ...existingAnnouncement,
            featured: false
          });
        }
      }
    }
    
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }
  
  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const existingAnnouncement = this.announcements.get(id);
    if (!existingAnnouncement) return undefined;
    
    // If this is being set as featured, un-feature all others
    if (announcement.featured && !existingAnnouncement.featured) {
      for (const [existingId, existingAnn] of this.announcements.entries()) {
        if (existingId !== id && existingAnn.featured) {
          this.announcements.set(existingId, {
            ...existingAnn,
            featured: false
          });
        }
      }
    }
    
    const updatedAnnouncement: Announcement = {
      ...existingAnnouncement,
      ...announcement
    };
    
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
  
  async getFeaturedAnnouncement(): Promise<Announcement | undefined> {
    return Array.from(this.announcements.values()).find(
      (announcement) => announcement.featured
    );
  }
  
  async setFeaturedAnnouncement(id: number): Promise<boolean> {
    const announcement = this.announcements.get(id);
    if (!announcement) return false;
    
    // Un-feature all announcements
    for (const [existingId, existingAnnouncement] of this.announcements.entries()) {
      if (existingAnnouncement.featured) {
        this.announcements.set(existingId, {
          ...existingAnnouncement,
          featured: false
        });
      }
    }
    
    // Set this one as featured
    this.announcements.set(id, {
      ...announcement,
      featured: true
    });
    
    return true;
  }
  
  // Stream settings methods
  async getStreamSettings(): Promise<StreamSetting | undefined> {
    return this.streamSettings;
  }
  
  async updateStreamSettings(settings: Partial<InsertStreamSetting>): Promise<StreamSetting> {
    if (!this.streamSettings) {
      const id = 1;
      this.streamSettings = {
        id,
        featuredChannel: settings.featuredChannel || "rennsz",
        autoDetect: settings.autoDetect !== undefined ? settings.autoDetect : true,
        offlineBehavior: settings.offlineBehavior || "message"
      };
    } else {
      this.streamSettings = {
        ...this.streamSettings,
        ...settings
      };
    }
    
    return this.streamSettings;
  }
  
  // Stream channels methods
  async getStreamChannels(): Promise<StreamChannel[]> {
    return Array.from(this.streamChannels.values());
  }
  
  async getStreamChannelById(id: number): Promise<StreamChannel | undefined> {
    return this.streamChannels.get(id);
  }
  
  async createStreamChannel(channel: InsertStreamChannel): Promise<StreamChannel> {
    const id = this.streamChannelCurrentId++;
    const newChannel: StreamChannel = {
      ...channel,
      id
    };
    
    // If this is being set as main, un-set all others
    if (newChannel.isMain) {
      for (const [existingId, existingChannel] of this.streamChannels.entries()) {
        if (existingChannel.isMain) {
          this.streamChannels.set(existingId, {
            ...existingChannel,
            isMain: false
          });
        }
      }
    }
    
    this.streamChannels.set(id, newChannel);
    return newChannel;
  }
  
  async updateStreamChannel(id: number, channel: Partial<InsertStreamChannel>): Promise<StreamChannel | undefined> {
    const existingChannel = this.streamChannels.get(id);
    if (!existingChannel) return undefined;
    
    // If this is being set as main, un-set all others
    if (channel.isMain && !existingChannel.isMain) {
      for (const [existingId, existingCh] of this.streamChannels.entries()) {
        if (existingId !== id && existingCh.isMain) {
          this.streamChannels.set(existingId, {
            ...existingCh,
            isMain: false
          });
        }
      }
    }
    
    const updatedChannel: StreamChannel = {
      ...existingChannel,
      ...channel
    };
    
    this.streamChannels.set(id, updatedChannel);
    return updatedChannel;
  }
  
  async deleteStreamChannel(id: number): Promise<boolean> {
    return this.streamChannels.delete(id);
  }
  
  // Theme settings methods
  async getThemeSettings(): Promise<ThemeSetting[]> {
    return Array.from(this.themeSettings.values());
  }
  
  async getActiveTheme(): Promise<ThemeSetting | undefined> {
    return Array.from(this.themeSettings.values()).find(
      (theme) => theme.isActive
    );
  }
  
  async getThemeById(id: number): Promise<ThemeSetting | undefined> {
    return this.themeSettings.get(id);
  }
  
  async createTheme(theme: InsertThemeSetting): Promise<ThemeSetting> {
    const id = this.themeSettingCurrentId++;
    const newTheme: ThemeSetting = {
      ...theme,
      id
    };
    
    // If this is being set as active, deactivate all others
    if (newTheme.isActive) {
      for (const [existingId, existingTheme] of this.themeSettings.entries()) {
        if (existingTheme.isActive) {
          this.themeSettings.set(existingId, {
            ...existingTheme,
            isActive: false
          });
        }
      }
    }
    
    this.themeSettings.set(id, newTheme);
    return newTheme;
  }
  
  async updateTheme(id: number, theme: Partial<InsertThemeSetting>): Promise<ThemeSetting | undefined> {
    const existingTheme = this.themeSettings.get(id);
    if (!existingTheme) return undefined;
    
    // If this is being activated, deactivate all others
    if (theme.isActive && !existingTheme.isActive) {
      for (const [existingId, existingTh] of this.themeSettings.entries()) {
        if (existingId !== id && existingTh.isActive) {
          this.themeSettings.set(existingId, {
            ...existingTh,
            isActive: false
          });
        }
      }
    }
    
    const updatedTheme: ThemeSetting = {
      ...existingTheme,
      ...theme
    };
    
    this.themeSettings.set(id, updatedTheme);
    return updatedTheme;
  }
  
  async deleteTheme(id: number): Promise<boolean> {
    // Don't allow deleting the active theme
    const theme = this.themeSettings.get(id);
    if (theme?.isActive) return false;
    
    return this.themeSettings.delete(id);
  }
  
  async setActiveTheme(id: number): Promise<boolean> {
    const theme = this.themeSettings.get(id);
    if (!theme) return false;
    
    // Deactivate all themes
    for (const [existingId, existingTheme] of this.themeSettings.entries()) {
      if (existingTheme.isActive) {
        this.themeSettings.set(existingId, {
          ...existingTheme,
          isActive: false
        });
      }
    }
    
    // Set this one as active
    this.themeSettings.set(id, {
      ...theme,
      isActive: true
    });
    
    return true;
  }
  
  // Activity logs methods
  async getLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async createLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogCurrentId++;
    const newLog: ActivityLog = {
      ...log,
      id,
      timestamp: new Date()
    };
    
    this.activityLogs.set(id, newLog);
    return newLog;
  }
}

export const storage = new MemStorage();
