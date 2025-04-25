import { useState, useEffect } from "react";
import { FaEye, FaChartLine, FaPlusCircle, FaStream, FaPalette, FaCog, FaUserEdit, FaBullhorn, FaVideo } from "react-icons/fa";
import { useAdmin } from "@/hooks/useAdmin";
import { useTheme } from "@/hooks/useTheme";

export default function Dashboard() {
  const { logs } = useAdmin();
  const { setActiveSection } = useAdmin();
  const [websiteTitle, setWebsiteTitle] = useState(() =>
    localStorage.getItem('websiteTitle') || 'My Website'
  );
  const [websiteStats, setWebsiteStats] = useState({
    totalViews: 0,
    increase: 0
  });

  // Quick action to update website title
  const updateWebsiteTitle = () => {
    localStorage.setItem('websiteTitle', websiteTitle);
    document.title = websiteTitle;
  };

  useEffect(() => {
    document.title = websiteTitle;
    const getPageViews = () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const lastMonth = `${now.getFullYear()}-${now.getMonth()}`;

      const storedViews = localStorage.getItem('pageViews') ?
        JSON.parse(localStorage.getItem('pageViews') || '{}') : {};

      if (!storedViews[currentMonth]) {
        storedViews[currentMonth] = 0;
      }

      storedViews[currentMonth] += 1;
      localStorage.setItem('pageViews', JSON.stringify(storedViews));

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

  const recentLogs = logs?.slice(0, 5) || [];

  const getColorForLog = (category: string) => {
    switch (category) {
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
    <div className="space-y-8">
      {/* Website Title Settings */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 gold-gradient">Website Settings</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={websiteTitle}
            onChange={(e) => setWebsiteTitle(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2"
            placeholder="Website Title"
          />
          <button
            onClick={updateWebsiteTitle}
            className="bg-[#D4AF37] text-black px-4 py-2 rounded hover:bg-[#C4A027]"
          >
            Update Title
          </button>
        </div>
      </div>

      {/* Website Statistics */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="glass p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400">Website Visits</p>
              <h3 className="text-2xl font-bold mt-1">{websiteStats.totalViews ? websiteStats.totalViews.toLocaleString() : "0"}</h3>
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

      {/* Quick Actions */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 gold-gradient">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSection("announcements")}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 text-left"
          >
            <h3 className="font-medium mb-2">New Announcement</h3>
            <p className="text-sm text-gray-400">Create and publish a new announcement</p>
          </button>

          <button
            onClick={() => setActiveSection("streams")}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 text-left"
          >
            <h3 className="font-medium mb-2">Manage Streams</h3>
            <p className="text-sm text-gray-400">Update stream settings and channels</p>
          </button>

          <button
            onClick={() => setActiveSection("themes")}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 text-left"
          >
            <h3 className="font-medium mb-2">Theme Settings</h3>
            <p className="text-sm text-gray-400">Customize website appearance</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 gold-gradient">Recent Activity</h2>
        <div className="space-y-4">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, index) => (
              <div key={index} className="flex items-start">
                <div className={`${getColorForLog(log.category)} rounded-full p-2 mr-4`}>
                  {/* Icon would go here -  Consider adding icons based on log.category */}
                </div>
                <div>
                  <p className="font-medium">{log.message}</p>
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