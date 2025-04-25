import { storage } from './storage';
import { log } from './vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path for ESM modules (replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the backup directory
const BACKUP_DIR = path.join(__dirname, '../backups');
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Interface for backup data
interface BackupData {
  announcements: any[];
  streamSettings: any;
  streamChannels: any[];
  themeSettings: any[];
  activeThemeId: number | null;
  timestamp: string;
}

// Create a backup of the current state
async function createBackup(): Promise<string> {
  try {
    // Get all data
    const announcements = await storage.getAnnouncements();
    const streamSettings = await storage.getStreamSettings();
    const streamChannels = await storage.getStreamChannels();
    const themeSettings = await storage.getThemeSettings();
    const activeTheme = await storage.getActiveTheme();
    
    // Create backup object
    const backupData: BackupData = {
      announcements,
      streamSettings,
      streamChannels,
      themeSettings,
      activeThemeId: activeTheme?.id || null,
      timestamp: new Date().toISOString()
    };
    
    // Save to file
    const backupFileName = `backup_${Date.now()}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    log(`Created backup: ${backupFileName}`, 'backup');
    
    // Clean up old backups (keep only the last 10)
    cleanupOldBackups();
    
    return backupPath;
  } catch (error) {
    log(`Error creating backup: ${error}`, 'backup');
    throw error;
  }
}

// Get the most recent backup
function getLatestBackup(): string | null {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by timestamp in filenames (newest first)
        const timestampA = parseInt(a.split('_')[1].split('.')[0]);
        const timestampB = parseInt(b.split('_')[1].split('.')[0]);
        return timestampB - timestampA;
      });
    
    if (files.length === 0) {
      return null;
    }
    
    return path.join(BACKUP_DIR, files[0]);
  } catch (error) {
    log(`Error getting latest backup: ${error}`, 'backup');
    return null;
  }
}

// Clean up old backups to save space
function cleanupOldBackups(keepCount = 10): void {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by timestamp in filenames (oldest first)
        const timestampA = parseInt(a.split('_')[1].split('.')[0]);
        const timestampB = parseInt(b.split('_')[1].split('.')[0]);
        return timestampA - timestampB;
      });
    
    // Delete old backups beyond the keepCount
    if (files.length > keepCount) {
      const filesToDelete = files.slice(0, files.length - keepCount);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
        log(`Deleted old backup: ${file}`, 'backup');
      });
    }
  } catch (error) {
    log(`Error cleaning up old backups: ${error}`, 'backup');
  }
}

// Restore from a backup file
async function restoreFromBackup(backupPath: string): Promise<void> {
  try {
    const backupJson = fs.readFileSync(backupPath, 'utf8');
    const backupData: BackupData = JSON.parse(backupJson);
    
    log(`Restoring from backup: ${path.basename(backupPath)}`, 'backup');
    
    // Create an activity log entry about the restoration
    await storage.createLog({
      action: 'System Restore',
      details: `Restored system from backup created at ${backupData.timestamp}`,
      category: 'system'
    });
    
    // Restore announcements
    if (backupData.announcements) {
      // First, clear out existing announcements
      const currentAnnouncements = await storage.getAnnouncements();
      for (const announcement of currentAnnouncements) {
        await storage.deleteAnnouncement(announcement.id);
      }
      
      // Then recreate from backup
      for (const announcement of backupData.announcements) {
        const { id, ...announcementData } = announcement;
        await storage.createAnnouncement(announcementData);
      }
    }
    
    // Restore stream settings
    if (backupData.streamSettings) {
      await storage.updateStreamSettings(backupData.streamSettings);
    }
    
    // Restore stream channels
    if (backupData.streamChannels) {
      // First, clear existing channels
      const currentChannels = await storage.getStreamChannels();
      for (const channel of currentChannels) {
        await storage.deleteStreamChannel(channel.id);
      }
      
      // Then recreate from backup
      for (const channel of backupData.streamChannels) {
        const { id, ...channelData } = channel;
        await storage.createStreamChannel(channelData);
      }
    }
    
    // Restore theme settings
    if (backupData.themeSettings) {
      // First, clear existing themes
      const currentThemes = await storage.getThemeSettings();
      for (const theme of currentThemes) {
        await storage.deleteTheme(theme.id);
      }
      
      // Then recreate from backup
      for (const theme of backupData.themeSettings) {
        const { id, ...themeData } = theme;
        await storage.createTheme(themeData);
      }
      
      // Restore active theme if it exists
      if (backupData.activeThemeId !== null) {
        await storage.setActiveTheme(backupData.activeThemeId);
      }
    }
    
    log(`Restore completed successfully`, 'backup');
  } catch (error) {
    log(`Error restoring from backup: ${error}`, 'backup');
    throw error;
  }
}

// Initialize the backup system
function initBackupSystem(): void {
  // Schedule backup process every 5 minutes
  log(`Initializing automated backup system with ${BACKUP_INTERVAL / 60000} minute interval`, 'backup');
  
  // Create initial backup
  setTimeout(async () => {
    try {
      await createBackup();
      log('Initial backup created', 'backup');
    } catch (error) {
      log(`Error creating initial backup: ${error}`, 'backup');
    }
  }, 10000); // Initial backup after 10 seconds
  
  // Set up recurring backup cycle
  setInterval(async () => {
    try {
      // Step 1: Create a new backup
      await createBackup();
      log('Scheduled backup created', 'backup');
      
      // Step 2: After backup is created, restore from most recent (which is the one we just created)
      // This creates the cyclical backup/restore system requested
      const latestBackup = getLatestBackup();
      if (latestBackup) {
        await restoreFromBackup(latestBackup);
        log('Restored from latest backup', 'backup');
      }
    } catch (error) {
      log(`Error in backup/restore cycle: ${error}`, 'backup');
    }
  }, BACKUP_INTERVAL);
}

export {
  initBackupSystem,
  createBackup,
  restoreFromBackup,
  getLatestBackup
};