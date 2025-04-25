import { useEffect, useState } from "react";
import { 
  FaUser, FaEdit, FaBullhorn, FaVideo, 
  FaPalette, FaSignInAlt, FaSignOutAlt, FaTrash, 
  FaStar, FaCheck, FaDownload
} from "react-icons/fa";
import { format } from "date-fns";
import { useAdmin } from "@/hooks/useAdmin";

export default function LogViewer() {
  const { logs, fetchLogs } = useAdmin();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("json");
  
  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  // Filter logs based on category and search term
  const filteredLogs = logs?.filter(log => {
    const matchesFilter = filter === "all" || log.category === filter;
    const matchesSearch = 
      search === "" || 
      log.action.toLowerCase().includes(search.toLowerCase()) || 
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }) || [];
  
  // Get icon for log category
  const getIconForCategory = (category: string) => {
    switch (category) {
      case "auth":
        return log => log.action.includes("Login") ? <FaSignInAlt /> : <FaSignOutAlt />;
      case "announcement":
        return log => {
          if (log.action.includes("Create")) return <FaBullhorn />;
          if (log.action.includes("Update")) return <FaEdit />;
          if (log.action.includes("Delete")) return <FaTrash />;
          if (log.action.includes("Feature")) return <FaStar />;
          return <FaBullhorn />;
        };
      case "stream":
        return () => <FaVideo />;
      case "theme":
        return log => {
          if (log.action.includes("Activate")) return <FaCheck />;
          return <FaPalette />;
        };
      default:
        return () => <FaUser />;
    }
  };
  
  // Get color for log category
  const getColorForCategory = (category: string) => {
    switch (category) {
      case "auth":
        return "text-blue-400";
      case "announcement":
        return "text-green-400";
      case "stream":
        return "text-purple-400";
      case "theme":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };
  
  // Export logs
  const exportLogs = () => {
    const dataToExport = filteredLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      category: log.category,
      timestamp: log.timestamp,
      adminId: log.adminId
    }));
    
    let fileContent, fileName, fileType;
    
    if (exportFormat === "json") {
      fileContent = JSON.stringify(dataToExport, null, 2);
      fileName = `rennsz_logs_${new Date().toISOString().slice(0, 10)}.json`;
      fileType = "application/json";
    } else {
      // CSV format
      const headers = "id,action,details,category,timestamp,adminId\n";
      const rows = dataToExport.map(log => {
        return `${log.id},"${log.action}","${log.details || ""}","${log.category}","${log.timestamp}",${log.adminId || ""}`;
      }).join("\n");
      
      fileContent = headers + rows;
      fileName = `rennsz_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      fileType = "text/csv";
    }
    
    // Create download link
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Activity Logs</h1>
      
      <div className="glass rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Filter by Category</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-40 p-2 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="auth">Authentication</option>
                <option value="announcement">Announcements</option>
                <option value="stream">Stream Settings</option>
                <option value="theme">Theme Settings</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Search Logs</label>
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by action or details..." 
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className="p-2 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            
            <button 
              onClick={exportLogs}
              className="px-4 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors flex items-center"
            >
              <FaDownload className="mr-2" /> Export Logs
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const IconComponent = getIconForCategory(log.category)(log);
                  const colorClass = getColorForCategory(log.category);
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-800">
                      <td className="py-3 px-4 whitespace-nowrap text-sm">
                        {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`mr-2 ${colorClass}`}>{IconComponent}</span>
                          <span className="text-sm font-medium">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {log.details || "-"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-sm ${colorClass} font-medium`}>
                          {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    {logs?.length === 0 
                      ? "No activity logs found." 
                      : "No logs matching your filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {logs && logs.length > 0 && filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        )}
      </div>
    </div>
  );
}
