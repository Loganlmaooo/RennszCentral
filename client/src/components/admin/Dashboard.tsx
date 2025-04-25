import { useState, useEffect } from "react";
import { 
  FaEye, FaChartLine, 
  FaPlusCircle, FaStream, FaPalette, FaCog, 
  FaUserEdit, FaBullhorn, FaVideo 
} from "react-icons/fa";
import { useAdmin } from "@/hooks/useAdmin";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useStreams } from "@/hooks/useStreams";
import { useTheme } from "@/hooks/useTheme";

export default function Dashboard() {
  const { logs } = useAdmin();
  const { setActiveSection } = useAdmin();
  const [websiteStats, setWebsiteStats] = useState({
    totalViews: 0,
    increase: 0
  });
  
  // Use localStorage to track page views (this is a simplified approach for demo purposes)
  // In a real application, you would use server-side tracking and analytics
  useEffect(() => {
    const getPageViews = () => {
      // Get the current month and the previous month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const lastMonth = `${now.getFullYear()}-${now.getMonth()}`;
      
      // Get stored views
      const storedViews = localStorage.getItem('pageViews') ? 
        JSON.parse(localStorage.getItem('pageViews') || '{}') : {};
      
      // If there's no entry for the current month, create one
      if (!storedViews[currentMonth]) {
        storedViews[currentMonth] = 0;
      }
      
      // Increment view count for current month
      storedViews[currentMonth] += 1;
      
      // Store back in localStorage
      localStorage.setItem('pageViews', JSON.stringify(storedViews));
      
      // Calculate increase percentage
      const lastMonthViews = storedViews[lastMonth] || 0;
      const currentMonthViews = storedViews[currentMonth];
      const increase = lastMonthViews > 0 ? 
        ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100 : 0;
      
      return {
        totalViews: currentMonthViews,
        increase: increase
      };
    };
    
    setWebsiteStats(getPageViews());
  }, []);
  
  const recentLogs = logs?.slice(0, 3) || [];
  
  const formatLogMessage = (log: any) => {
    switch(log.category) {
      case "theme":
        return `Updated site theme to ${log.details}`;
      case "announcement":
        return `Posted new announcement: "${log.details}"`;
      case "stream":
        return `Changed featured stream to ${log.details}`;
      default:
        return log.action;
    }
  };
  
  const getIconForLog = (category: string) => {
    switch(category) {
      case "theme":
        return <FaUserEdit className="text-white" />;
      case "announcement":
        return <FaBullhorn className="text-white" />;
      case "stream":
        return <FaVideo className="text-white" />;
      default:
        return <FaCog className="text-white" />;
    }
  };
  
  const getColorForLog = (category: string) => {
    switch(category) {
      case "theme":
        return "bg-blue-500";
      case "announcement":
        return "bg-green-500";
      case "stream":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="glass p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400">Website Visits</p>
              <h3 className="text-2xl font-bold mt-1">{websiteStats.totalViews.toLocaleString()}</h3>
            </div>
            <span className="text-[#D4AF37] text-2xl">
              <FaEye />
            </span>
          </div>
          <div className="mt-4 text-sm">
            {websiteStats.increase > 0 ? (
              <>
                <span className="text-green-500">
                  <FaChartLine className="inline mr-1" />
                  {websiteStats.increase.toFixed(1)}%
                </span>
                <span className="text-gray-400 ml-1">from last month</span>
              </>
            ) : websiteStats.increase < 0 ? (
              <>
                <span className="text-red-500">
                  <FaChartLine className="inline mr-1 transform rotate-180" />
                  {Math.abs(websiteStats.increase).toFixed(1)}%
                </span>
                <span className="text-gray-400 ml-1">from last month</span>
              </>
            ) : (
              <span className="text-gray-400">First month of tracking</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="glass p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveSection("announcements")}
            className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors flex flex-col items-center justify-center text-center"
          >
            <FaPlusCircle className="text-2xl mb-2 text-[#D4AF37]" />
            <span>New Announcement</span>
          </button>
          <button 
            onClick={() => setActiveSection("streams")}
            className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors flex flex-col items-center justify-center text-center"
          >
            <FaStream className="text-2xl mb-2 text-[#9146FF]" />
            <span>Change Stream</span>
          </button>
          <button 
            onClick={() => setActiveSection("themes")}
            className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors flex flex-col items-center justify-center text-center"
          >
            <FaPalette className="text-2xl mb-2 text-blue-400" />
            <span>Update Theme</span>
          </button>
          <button className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors flex flex-col items-center justify-center text-center">
            <FaCog className="text-2xl mb-2 text-gray-400" />
            <span>Site Settings</span>
          </button>
        </div>
      </div>
      
      <div className="glass p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, index) => (
              <div key={index} className="flex items-start">
                <div className={`${getColorForLog(log.category)} rounded-full p-2 mr-4`}>
                  {getIconForLog(log.category)}
                </div>
                <div>
                  <p className="font-medium">{formatLogMessage(log)}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Admin • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
