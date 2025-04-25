import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAnnouncementSchema, 
  insertStreamSettingsSchema, 
  insertStreamChannelSchema, 
  insertThemeSettingsSchema,
  insertActivityLogSchema
} from "@shared/schema";
import axios from "axios";
import session from "express-session";
import MemoryStore from "memorystore";

// Discord webhook for logging
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360625407740612771/2NBUC4S-X55I6FgdE-FMOwJWJ-XHRGtG_o2Q23EuU_XHzJKmy4xjx6IEsVpjYUxuQt4Z";

// Function to send logs to Discord webhook
async function sendDiscordLog(action: string, details: string, category: string) {
  try {
    const log = {
      embeds: [{
        title: `Admin Action: ${action}`,
        description: details,
        color: 0xD4AF37, // Gold color
        fields: [
          {
            name: "Category",
            value: category,
            inline: true
          },
          {
            name: "Timestamp",
            value: new Date().toLocaleString("en-US", {
              timeZone: "America/New_York",
              dateStyle: "medium",
              timeStyle: "medium"
            }),
            inline: true
          }
        ],
        footer: {
          text: "RENNSZ Admin Panel"
        }
      }]
    };
    
    await axios.post(DISCORD_WEBHOOK_URL, log);
  } catch (error) {
    console.error("Failed to send Discord webhook:", error);
  }
}

// Helper function to create activity log and send to Discord
async function logActivity(action: string, details: string, category: string, adminId?: number) {
  try {
    const logData = {
      action,
      details,
      adminId,
      category
    };
    
    // Validate the log data
    const parsedLog = insertActivityLogSchema.parse(logData);
    
    // Store in database
    await storage.createLog(parsedLog);
    
    // Send to Discord webhook
    await sendDiscordLog(action, details, category);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware for admin authentication
  const SessionStore = MemoryStore(session);
  
  app.use(session({
    secret: "rennsz-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }, // 24 hours
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Define authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.adminId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
  
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set the admin in the session
      req.session.adminId = admin.id;
      req.session.username = admin.username;
      
      await logActivity("Login", `Admin ${username} logged in`, "auth", admin.id);
      
      res.json({ message: "Authentication successful" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/logout", authenticate, async (req, res) => {
    try {
      const adminId = req.session.adminId;
      const username = req.session.username;
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        logActivity("Logout", `Admin ${username} logged out`, "auth", adminId as number);
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/session", (req, res) => {
    if (req.session && req.session.adminId) {
      res.json({ 
        authenticated: true, 
        username: req.session.username 
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // Announcements routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get announcements" });
    }
  });
  
  app.get("/api/announcements/featured", async (req, res) => {
    try {
      const announcement = await storage.getFeaturedAnnouncement();
      if (!announcement) {
        return res.status(404).json({ message: "No featured announcement found" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to get featured announcement" });
    }
  });
  
  app.get("/api/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const announcement = await storage.getAnnouncementById(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to get announcement" });
    }
  });
  
  app.post("/api/announcements", authenticate, async (req, res) => {
    try {
      const announcementData = req.body;
      
      // Validate announcement data
      const parsedAnnouncement = insertAnnouncementSchema.parse(announcementData);
      
      // Create the announcement
      const announcement = await storage.createAnnouncement(parsedAnnouncement);
      
      await logActivity(
        "Create Announcement", 
        `Created announcement "${announcement.title}"`, 
        "announcement",
        req.session.adminId as number
      );
      
      res.status(201).json(announcement);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  
  app.put("/api/announcements/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const announcementData = req.body;
      
      // Get existing announcement to check if it exists
      const existingAnnouncement = await storage.getAnnouncementById(id);
      if (!existingAnnouncement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Update the announcement
      const announcement = await storage.updateAnnouncement(id, announcementData);
      
      await logActivity(
        "Update Announcement", 
        `Updated announcement "${announcement?.title}"`, 
        "announcement",
        req.session.adminId as number
      );
      
      res.json(announcement);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });
  
  app.delete("/api/announcements/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get announcement to include in the log
      const announcement = await storage.getAnnouncementById(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Delete the announcement
      const success = await storage.deleteAnnouncement(id);
      if (!success) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      await logActivity(
        "Delete Announcement", 
        `Deleted announcement "${announcement.title}"`, 
        "announcement",
        req.session.adminId as number
      );
      
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });
  
  app.post("/api/announcements/:id/feature", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get announcement to include in the log
      const announcement = await storage.getAnnouncementById(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Set as featured
      const success = await storage.setFeaturedAnnouncement(id);
      if (!success) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      await logActivity(
        "Feature Announcement", 
        `Set announcement "${announcement.title}" as featured`, 
        "announcement",
        req.session.adminId as number
      );
      
      res.json({ message: "Announcement set as featured" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set featured announcement" });
    }
  });
  
  // Stream settings routes
  app.get("/api/stream-settings", async (req, res) => {
    try {
      const settings = await storage.getStreamSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stream settings" });
    }
  });
  
  app.put("/api/stream-settings", authenticate, async (req, res) => {
    try {
      const settingsData = req.body;
      
      // Validate settings data
      const parsedSettings = insertStreamSettingsSchema.partial().parse(settingsData);
      
      // Update settings
      const settings = await storage.updateStreamSettings(parsedSettings);
      
      await logActivity(
        "Update Stream Settings", 
        `Updated stream settings with featured channel: ${settings.featuredChannel}`, 
        "stream",
        req.session.adminId as number
      );
      
      res.json(settings);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid stream settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stream settings" });
    }
  });
  
  // Stream channels routes
  app.get("/api/stream-channels", async (req, res) => {
    try {
      const channels = await storage.getStreamChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stream channels" });
    }
  });
  
  app.get("/api/stream-channels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const channel = await storage.getStreamChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Stream channel not found" });
      }
      
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stream channel" });
    }
  });
  
  app.post("/api/stream-channels", authenticate, async (req, res) => {
    try {
      const channelData = req.body;
      
      // Validate channel data
      const parsedChannel = insertStreamChannelSchema.parse(channelData);
      
      // Create the channel
      const channel = await storage.createStreamChannel(parsedChannel);
      
      await logActivity(
        "Create Stream Channel", 
        `Created stream channel "${channel.displayName}"`, 
        "stream",
        req.session.adminId as number
      );
      
      res.status(201).json(channel);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid stream channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stream channel" });
    }
  });
  
  app.put("/api/stream-channels/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const channelData = req.body;
      
      // Get existing channel to check if it exists
      const existingChannel = await storage.getStreamChannelById(id);
      if (!existingChannel) {
        return res.status(404).json({ message: "Stream channel not found" });
      }
      
      // Update the channel
      const channel = await storage.updateStreamChannel(id, channelData);
      
      await logActivity(
        "Update Stream Channel", 
        `Updated stream channel "${channel?.displayName}"`, 
        "stream",
        req.session.adminId as number
      );
      
      res.json(channel);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid stream channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stream channel" });
    }
  });
  
  app.delete("/api/stream-channels/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get channel to include in the log
      const channel = await storage.getStreamChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Stream channel not found" });
      }
      
      // Delete the channel
      const success = await storage.deleteStreamChannel(id);
      if (!success) {
        return res.status(404).json({ message: "Stream channel not found" });
      }
      
      await logActivity(
        "Delete Stream Channel", 
        `Deleted stream channel "${channel.displayName}"`, 
        "stream",
        req.session.adminId as number
      );
      
      res.json({ message: "Stream channel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stream channel" });
    }
  });
  
  // Theme settings routes
  app.get("/api/themes", async (req, res) => {
    try {
      const themes = await storage.getThemeSettings();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get themes" });
    }
  });
  
  app.get("/api/themes/active", async (req, res) => {
    try {
      const theme = await storage.getActiveTheme();
      if (!theme) {
        return res.status(404).json({ message: "No active theme found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active theme" });
    }
  });
  
  app.get("/api/themes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const theme = await storage.getThemeById(id);
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to get theme" });
    }
  });
  
  app.post("/api/themes", authenticate, async (req, res) => {
    try {
      const themeData = req.body;
      
      // Validate theme data
      const parsedTheme = insertThemeSettingsSchema.parse(themeData);
      
      // Create the theme
      const theme = await storage.createTheme(parsedTheme);
      
      await logActivity(
        "Create Theme", 
        `Created theme "${theme.name}"`, 
        "theme",
        req.session.adminId as number
      );
      
      res.status(201).json(theme);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid theme data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theme" });
    }
  });
  
  app.put("/api/themes/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const themeData = req.body;
      
      // Get existing theme to check if it exists
      const existingTheme = await storage.getThemeById(id);
      if (!existingTheme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      // Update the theme
      const theme = await storage.updateTheme(id, themeData);
      
      await logActivity(
        "Update Theme", 
        `Updated theme "${theme?.name}"`, 
        "theme",
        req.session.adminId as number
      );
      
      res.json(theme);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ message: "Invalid theme data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
  
  app.delete("/api/themes/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get theme to include in the log
      const theme = await storage.getThemeById(id);
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      // Check if it's the active theme
      if (theme.isActive) {
        return res.status(400).json({ message: "Cannot delete the active theme" });
      }
      
      // Delete the theme
      const success = await storage.deleteTheme(id);
      if (!success) {
        return res.status(404).json({ message: "Theme not found or cannot be deleted" });
      }
      
      await logActivity(
        "Delete Theme", 
        `Deleted theme "${theme.name}"`, 
        "theme",
        req.session.adminId as number
      );
      
      res.json({ message: "Theme deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete theme" });
    }
  });
  
  app.post("/api/themes/:id/activate", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get theme to include in the log
      const theme = await storage.getThemeById(id);
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      // Set as active
      const success = await storage.setActiveTheme(id);
      if (!success) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      await logActivity(
        "Activate Theme", 
        `Set theme "${theme.name}" as active`, 
        "theme",
        req.session.adminId as number
      );
      
      res.json({ message: "Theme set as active" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set active theme" });
    }
  });
  
  // Activity logs routes
  app.get("/api/logs", authenticate, async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
