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
      
      {/* Floating Admin Button */}
      <button
        onClick={() => setShowLoginModal(true)}
        className="fixed bottom-4 right-4 bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4M4 20v-1.6c0-2 4-3.1 8-3.1s8 1.1 8 3.1V20" />
        </svg>
      </button>
      
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
