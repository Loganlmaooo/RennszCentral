import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReactNode, useState, useEffect, createContext } from "react";
import { AdminProvider } from "@/hooks/useAdmin";
import { ThemeProvider } from "@/hooks/useTheme";
import { StreamProvider } from "@/hooks/useStreams";
import { AnnouncementProvider } from "@/hooks/useAnnouncements";

export const MobileContext = createContext<boolean>(false);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MobileContext.Provider value={isMobile}>
        <AdminProvider>
          <ThemeProvider>
            <StreamProvider>
              <AnnouncementProvider>
                {children}
              </AnnouncementProvider>
            </StreamProvider>
          </ThemeProvider>
        </AdminProvider>
      </MobileContext.Provider>
    </QueryClientProvider>
  );
}
