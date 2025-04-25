import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AllAnnouncements from "@/pages/AllAnnouncements";
import AnnouncementDetail from "@/pages/AnnouncementDetail";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import { useAdmin } from "@/hooks/useAdmin";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

// Admin page component
function AdminPage() {
  const { isAuthenticated } = useAdmin();
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <>
      {/* Admin Login Modal */}
      <AdminLogin 
        isOpen={showLoginModal && !isAuthenticated} 
        onClose={() => window.location.href = "/"}
        onSuccess={() => {
          setShowLoginModal(false);
          setShowAdminPanel(true);
        }}
      />
      
      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdminPanel || isAuthenticated} 
        onClose={() => window.location.href = "/"}
      />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/announcements" component={AllAnnouncements} />
      <Route path="/announcements/:id" component={AnnouncementDetail} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { fetchActiveTheme, activeTheme } = useTheme();

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  // Apply theme CSS variables
  useEffect(() => {
    if (activeTheme) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', activeTheme.primaryColor);
      root.style.setProperty('--secondary-color', activeTheme.secondaryColor);
      root.style.setProperty('--accent-color', activeTheme.accentColor);
      root.style.setProperty('--text-color', activeTheme.textColor);
      
      // Set background
      if (activeTheme.backgroundType === 'image') {
        document.body.style.backgroundImage = `url(${activeTheme.backgroundValue})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundBlendMode = 'overlay';
      } else if (activeTheme.backgroundType === 'gradient') {
        document.body.style.backgroundImage = activeTheme.backgroundValue;
      } else {
        document.body.style.backgroundColor = activeTheme.backgroundValue;
        document.body.style.backgroundImage = 'none';
      }
      
      // Set fonts
      root.style.setProperty('--heading-font', activeTheme.headingFont);
      root.style.setProperty('--body-font', activeTheme.bodyFont);
    }
  }, [activeTheme]);

  return (
    <TooltipProvider>
      <Toaster />
      <Layout>
        <Router />
      </Layout>
    </TooltipProvider>
  );
}

export default App;
