import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Announcement, InsertAnnouncement } from "@/types";
import { useAdmin } from "./useAdmin";

interface AnnouncementContextProps {
  announcements: Announcement[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchAnnouncements: () => Promise<void>;
  createAnnouncement: (announcement: InsertAnnouncement) => Promise<Announcement>;
  updateAnnouncement: (id: number, announcement: Partial<InsertAnnouncement>) => Promise<Announcement>;
  deleteAnnouncement: (id: number) => Promise<void>;
  featuredAnnouncement: Announcement | null;
  setFeaturedAnnouncement: (id: number) => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextProps>({
  announcements: null,
  isLoading: false,
  error: null,
  fetchAnnouncements: async () => {},
  createAnnouncement: async () => ({ id: 0, title: "", content: "", date: new Date(), featured: false }),
  updateAnnouncement: async () => ({ id: 0, title: "", content: "", date: new Date(), featured: false }),
  deleteAnnouncement: async () => {},
  featuredAnnouncement: null,
  setFeaturedAnnouncement: async () => {}
});

interface AnnouncementProviderProps {
  children: ReactNode;
}

export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [featuredAnnouncement, setFeaturedAnnouncementState] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAdmin();
  
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/announcements");
      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }
      
      const data: Announcement[] = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchFeaturedAnnouncement = useCallback(async () => {
    try {
      const response = await fetch("/api/announcements/featured");
      if (!response.ok) {
        if (response.status !== 404) {
          console.error(`Failed to fetch featured announcement: ${response.status}`);
        }
        return;
      }
      
      const data: Announcement = await response.json();
      setFeaturedAnnouncementState(data);
    } catch (err) {
      console.error("Error fetching featured announcement:", err);
    }
  }, []);
  
  useEffect(() => {
    fetchAnnouncements();
    fetchFeaturedAnnouncement();
  }, [fetchAnnouncements, fetchFeaturedAnnouncement]);
  
  const createAnnouncement = useCallback(async (announcement: InsertAnnouncement): Promise<Announcement> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("POST", "/api/announcements", announcement);
    const newAnnouncement: Announcement = await response.json();
    
    // Update local state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements ? [newAnnouncement, ...prevAnnouncements] : [newAnnouncement]
    );
    
    // If this is featured, update featured announcement
    if (newAnnouncement.featured) {
      setFeaturedAnnouncementState(newAnnouncement);
    }
    
    return newAnnouncement;
  }, [isAuthenticated]);
  
  const updateAnnouncement = useCallback(async (id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    const response = await apiRequest("PUT", `/api/announcements/${id}`, announcement);
    const updatedAnnouncement: Announcement = await response.json();
    
    // Update local state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements 
        ? prevAnnouncements.map(a => a.id === id ? updatedAnnouncement : a)
        : null
    );
    
    // Update featured announcement if needed
    if (updatedAnnouncement.featured) {
      setFeaturedAnnouncementState(updatedAnnouncement);
    } else if (featuredAnnouncement?.id === id) {
      // If this was the featured one and is no longer featured, clear it
      fetchFeaturedAnnouncement();
    }
    
    return updatedAnnouncement;
  }, [isAuthenticated, featuredAnnouncement, fetchFeaturedAnnouncement]);
  
  const deleteAnnouncement = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    await apiRequest("DELETE", `/api/announcements/${id}`);
    
    // Update local state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements ? prevAnnouncements.filter(a => a.id !== id) : null
    );
    
    // If this was the featured announcement, clear it
    if (featuredAnnouncement?.id === id) {
      setFeaturedAnnouncementState(null);
    }
  }, [isAuthenticated, featuredAnnouncement]);
  
  const setFeaturedAnnouncement = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated) throw new Error("Authentication required");
    
    await apiRequest("POST", `/api/announcements/${id}/feature`);
    
    // Update local state to reflect the change
    fetchAnnouncements();
    fetchFeaturedAnnouncement();
  }, [isAuthenticated, fetchAnnouncements, fetchFeaturedAnnouncement]);
  
  const contextValue = {
    announcements,
    isLoading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    featuredAnnouncement,
    setFeaturedAnnouncement
  };
  
  return createElement(AnnouncementContext.Provider, { value: contextValue }, children);
}

export function useAnnouncements() {
  return useContext(AnnouncementContext);
}