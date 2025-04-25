import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from "react";
import { apiRequest } from "@/lib/queryClient";
import { StreamSetting, StreamChannel, InsertStreamSetting, InsertStreamChannel } from "@/types";
import { StreamStatusMap, checkStreamStatus } from "@/lib/twitch";
import { useAdmin } from "./useAdmin";

interface StreamContextProps {
  streamSettings: StreamSetting | null;
  streamChannels: StreamChannel[] | null;
  streamStatus: StreamStatusMap | null;
  isLoading: boolean;
  error: Error | null;
  fetchStreamSettings: () => Promise<void>;
  fetchStreamChannels: () => Promise<void>;
  updateStreamSettings: (settings: Partial<InsertStreamSetting>) => Promise<StreamSetting>;
  createStreamChannel: (channel: InsertStreamChannel) => Promise<StreamChannel>;
  updateStreamChannel: (id: number, channel: Partial<InsertStreamChannel>) => Promise<StreamChannel>;
  deleteStreamChannel: (id: number) => Promise<void>;
  refreshStreamStatus: () => Promise<void>;
}

const StreamContext = createContext<StreamContextProps>({
  streamSettings: null,
  streamChannels: null,
  streamStatus: null,
  isLoading: false,
  error: null,
  fetchStreamSettings: async () => {},
  fetchStreamChannels: async () => {},
  updateStreamSettings: async () => ({ id: 0, featuredChannel: "", autoDetect: true, offlineBehavior: "message" }),
  createStreamChannel: async () => ({ 
    id: 0, 
    name: "", 
    url: "", 
    displayName: "", 
    type: "", 
    schedule: "",
    isMain: false 
  }),
  updateStreamChannel: async () => ({ 
    id: 0, 
    name: "", 
    url: "", 
    displayName: "", 
    type: "", 
    schedule: "",
    isMain: false 
  }),
  deleteStreamChannel: async () => {},
  refreshStreamStatus: async () => {}
});

interface StreamProviderProps {
  children: ReactNode;
}

export function StreamProvider({ children }: StreamProviderProps) {
  const [streamSettings, setStreamSettings] = useState<StreamSetting | null>(null);
  const [streamChannels, setStreamChannels] = useState<StreamChannel[] | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatusMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAdmin();
  
  const fetchStreamSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/stream-settings");
      if (!response.ok) {
        throw new Error(`Failed to fetch stream settings: ${response.status}`);
      }
      
      const data: StreamSetting = await response.json();
      setStreamSettings(data);
    } catch (err) {
      console.error("Error fetching stream settings:", err);
    }
  }, []);
  
  const fetchStreamChannels = useCallback(async () => {
    try {
      const response = await fetch("/api/stream-channels");
      if (!response.ok) {
        throw new Error(`Failed to fetch stream channels: ${response.status}`);
      }
      
      const data: StreamChannel[] = await response.json();
      setStreamChannels(data);
    } catch (err) {
      console.error("Error fetching stream channels:", err);
    }
  }, []);
  
  const refreshStreamStatus = useCallback(async () => {
    if (!streamChannels) return;
    
    try {
      const channelNames = streamChannels.map(channel => channel.name);
      const status = await checkStreamStatus(channelNames);
      setStreamStatus(status);
    } catch (err) {
      console.error("Error refreshing stream status:", err);
    }
  }, [streamChannels]);
  
  useEffect(() => {
    fetchStreamSettings();
    fetchStreamChannels();
  }, [fetchStreamSettings, fetchStreamChannels]);
  
  useEffect(() => {
    if (streamChannels) {
      refreshStreamStatus();
      
      // Set up interval to check stream status every minute
      const intervalId = setInterval(refreshStreamStatus, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [streamChannels, refreshStreamStatus]);
  
  const updateStreamSettings = useCallback(async (settings: Partial<InsertStreamSetting>): Promise<StreamSetting> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("PUT", "/api/stream-settings", settings);
    const updatedSettings: StreamSetting = await response.json();
    
    // Update local state
    setStreamSettings(updatedSettings);
    
    return updatedSettings;
  }, [isAuthenticated]);
  
  const createStreamChannel = useCallback(async (channel: InsertStreamChannel): Promise<StreamChannel> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("POST", "/api/stream-channels", channel);
    const newChannel: StreamChannel = await response.json();
    
    // Update local state
    setStreamChannels(prevChannels => 
      prevChannels ? [...prevChannels, newChannel] : [newChannel]
    );
    
    return newChannel;
  }, [isAuthenticated]);
  
  const updateStreamChannel = useCallback(async (id: number, channel: Partial<InsertStreamChannel>): Promise<StreamChannel> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("PUT", `/api/stream-channels/${id}`, channel);
    const updatedChannel: StreamChannel = await response.json();
    
    // Update local state
    setStreamChannels(prevChannels => 
      prevChannels 
        ? prevChannels.map(c => c.id === id ? updatedChannel : c)
        : null
    );
    
    return updatedChannel;
  }, [isAuthenticated]);
  
  const deleteStreamChannel = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    await apiRequest("DELETE", `/api/stream-channels/${id}`);
    
    // Update local state
    setStreamChannels(prevChannels => 
      prevChannels ? prevChannels.filter(c => c.id !== id) : null
    );
  }, [isAuthenticated]);
  
  const contextValue = {
    streamSettings,
    streamChannels,
    streamStatus,
    isLoading,
    error,
    fetchStreamSettings,
    fetchStreamChannels,
    updateStreamSettings,
    createStreamChannel,
    updateStreamChannel,
    deleteStreamChannel,
    refreshStreamStatus
  };
  
  return createElement(StreamContext.Provider, { value: contextValue }, children);
}

export function useStreams() {
  return useContext(StreamContext);
}