import { useState } from "react";
import { FaTimes, FaSignOutAlt, FaTachometerAlt, FaBullhorn, FaVideo, FaPalette, FaUsers, FaList } from "react-icons/fa";
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
  
  return (
    <div className="fixed inset-0 bg-primary z-50 overflow-auto">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 h-full gold-border-r">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold gold-gradient">Admin Panel</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            
            <div className="mt-8">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveSection("dashboard")}
                    className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "dashboard" ? "active text-white" : "text-gray-300"}`}
                  >
                    <FaTachometerAlt className="w-5 mr-3" /> Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection("announcements")}
                    className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "announcements" ? "active text-white" : "text-gray-300"}`}
                  >
                    <FaBullhorn className="w-5 mr-3" /> Announcements
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection("streams")}
                    className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "streams" ? "active text-white" : "text-gray-300"}`}
                  >
                    <FaVideo className="w-5 mr-3" /> Stream Settings
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection("themes")}
                    className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "themes" ? "active text-white" : "text-gray-300"}`}
                  >
                    <FaPalette className="w-5 mr-3" /> Theme Settings
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection("logs")}
                    className={`sidebar-item block py-2 px-4 rounded hover:bg-gray-800 w-full text-left flex items-center ${activeSection === "logs" ? "active text-white" : "text-gray-300"}`}
                  >
                    <FaList className="w-5 mr-3" /> Activity Logs
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <button 
              onClick={handleLogout}
              className="w-full py-2 text-gray-300 hover:text-white flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
