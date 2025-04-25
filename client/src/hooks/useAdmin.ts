import { createContext, useContext, useState, useCallback, ReactNode, useEffect, createElement } from "react";
import { login as authLogin, logout as authLogout, checkSession, getLogs as fetchActivityLogs } from "@/lib/auth";

interface AdminContextProps {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  logs: any[];
  fetchLogs: () => Promise<void>;
  setActiveSection: (section: string) => void;
  activeSection: string;
}

// Create the context with a default value
const AdminContext = createContext<AdminContextProps>({
  isAuthenticated: false,
  username: null,
  login: async () => false,
  logout: async () => {},
  logs: [],
  fetchLogs: async () => {},
  setActiveSection: () => {},
  activeSection: "dashboard"
});

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Check if the user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await checkSession();
      if (session.authenticated) {
        setIsAuthenticated(true);
        setUsername(session.username || null);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = useCallback(async (username: string, password: string) => {
    const success = await authLogin(username, password);
    if (success) {
      setIsAuthenticated(true);
      setUsername(username);
    }
    return success;
  }, []);
  
  // Logout function
  const logout = useCallback(async () => {
    await authLogout();
    setIsAuthenticated(false);
    setUsername(null);
  }, []);
  
  // Fetch activity logs
  const fetchLogs = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const activityLogs = await fetchActivityLogs();
    setLogs(activityLogs);
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, fetchLogs]);
  
  const contextValue = {
    isAuthenticated,
    username,
    login,
    logout,
    logs,
    fetchLogs,
    setActiveSection,
    activeSection
  };
  
  return createElement(AdminContext.Provider, { value: contextValue }, children);
}

export function useAdmin() {
  return useContext(AdminContext);
}