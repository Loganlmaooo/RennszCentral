// Define the Twitch stream status interface
export interface TwitchStreamStatus {
  isLive: boolean;
  viewers: number;
  title?: string;
  gameName?: string;
  thumbnailUrl?: string;
  startedAt?: string;
}

// Map of channel names to their status
export interface StreamStatusMap {
  [channelName: string]: TwitchStreamStatus;
}

/**
 * Uses Twitch API to check if a channel is currently live
 * Note: In a real implementation, you'd use the actual Twitch API
 * This is a simulated implementation that returns mock data
 * In production, this would make actual Twitch API calls
 */
export async function checkStreamStatus(channelNames: string[]): Promise<StreamStatusMap> {
  try {
    // This would normally be an API call to Twitch
    // For the implementation, we'll directly call our backend which
    // will handle the Twitch API interaction and caching
    
    // Construct the query parameter
    const channelsParam = channelNames.join(',');
    const response = await fetch(`/api/twitch/status?channels=${channelsParam}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check stream status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking Twitch stream status:", error);
    
    // Return offline status for all channels
    const result: StreamStatusMap = {};
    channelNames.forEach(name => {
      result[name] = {
        isLive: false,
        viewers: 0
      };
    });
    
    return result;
  }
}
