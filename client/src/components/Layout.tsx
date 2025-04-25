import { ReactNode, useContext, useState } from "react";
import { MobileContext } from "./Providers";
import { useAdmin } from "@/hooks/useAdmin";
import { Header } from "./Header";
import { Footer } from "./Footer";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useContext(MobileContext);
  const { isAuthenticated } = useAdmin();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isMobile={isMobile} 
        onLoginClick={() => setShowLoginModal(true)}
      />
      
      <main className="flex-grow pt-16">
        {children}
      </main>
      
      <Footer />
      
      {/* Admin Login Modal */}
      <AdminLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setShowAdminPanel(true);
        }}
      />
      
      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdminPanel && isAuthenticated} 
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
}
