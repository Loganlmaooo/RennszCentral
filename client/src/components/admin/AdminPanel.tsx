import { useState, useEffect } from "react";
import { FaTimes, FaSignOutAlt, FaTachometerAlt, FaBullhorn, FaVideo, FaPalette, FaList, FaBars } from "react-icons/fa";
import { useAdmin } from "@/hooks/useAdmin";
import Dashboard from "./Dashboard";
import AnnouncementManager from "./AnnouncementManager";
import StreamSettings from "./StreamSettings";
import ThemeSettings from "./ThemeSettings";
import LogViewer from "./LogViewer";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { logout } = useAdmin();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, sidebar is closed by default
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  
  if (!isOpen) return null;
  
  const handleLogout = async () => {
    await logout();
    onClose();
  };
  
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "announcements":
        return <AnnouncementManager />;
      case "streams":
        return <StreamSettings />;
      case "themes":
        return <ThemeSettings />;
      case "logs":
        return <LogViewer />;
      default:
        return <Dashboard />;
    }
  };
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // On mobile, close the sidebar after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-primary z-50 overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 p-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-gray-400 hover:text-white p-2"
          >
            <FaBars />
          </button>
          <h2 className="text-xl font-bold gold-gradient">Admin Panel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <FaTimes />
          </button>
        </div>
        
        {/* Sidebar - toggleable on mobile */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 bg-gray-900 h-full gold-border-r overflow-y-auto`}>
          {/* Desktop Header (hidden on mobile) */}
          <div className="hidden md:block p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold gold-gradient">Admin Panel</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleSectionChange("dashboard")}
                  className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "dashboard" ? "active text-white" : "text-gray-300"}`}
                >
                  <FaTachometerAlt className="w-5 mr-3" /> Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionChange("announcements")}
                  className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "announcements" ? "active text-white" : "text-gray-300"}`}
                >
                  <FaBullhorn className="w-5 mr-3" /> Announcements
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionChange("streams")}
                  className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "streams" ? "active text-white" : "text-gray-300"}`}
                >
                  <FaVideo className="w-5 mr-3" /> Stream Settings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionChange("themes")}
                  className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "themes" ? "active text-white" : "text-gray-300"}`}
                >
                  <FaPalette className="w-5 mr-3" /> Theme Settings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionChange("logs")}
                  className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "logs" ? "active text-white" : "text-gray-300"}`}
                >
                  <FaList className="w-5 mr-3" /> Activity Logs
                </button>
              </li>
            </ul>
          </div>
          
          <div className="p-6 md:absolute md:bottom-0 md:left-0 md:right-0">
            <button 
              onClick={handleLogout}
              className="w-full py-2 text-gray-300 hover:text-white flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
