import { apiRequest } from "./queryClient";
import { discordLog } from "./discord";

export interface LoginResponse {
  message: string;
}

export interface SessionResponse {
  authenticated: boolean;
  username?: string;
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/admin/login', { username, password });
    const data: LoginResponse = await response.json();
    
    if (data.message === "Authentication successful") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/admin/logout');
    const data: LoginResponse = await response.json();
    
    if (data.message === "Logout successful") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function checkSession(): Promise<SessionResponse> {
  try {
    const response = await fetch('/api/admin/session', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      return { authenticated: false };
    }
    
    return await response.json();
  } catch (error) {
    console.error("Session check error:", error);
    return { authenticated: false };
  }
}

export async function getLogs(): Promise<any[]> {
  try {
    const response = await fetch('/api/logs', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return [];
      }
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch logs error:", error);
    return [];
  }
}
