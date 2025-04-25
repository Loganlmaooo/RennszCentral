import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { FaArrowLeft, FaStar, FaCalendar } from "react-icons/fa";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Announcement } from "@/types";

export default function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const { announcements } = useAnnouncements();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Try to find the announcement in the context first
    if (announcements) {
      const foundAnnouncement = announcements.find(a => a.id === Number(id));
      if (foundAnnouncement) {
        setAnnouncement(foundAnnouncement);
        setIsLoading(false);
        document.title = `${foundAnnouncement.title} - RENNSZ Announcements`;
        return;
      }
    }
    
    // If not found, fetch it
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/announcements/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/announcements");
            return;
          }
          throw new Error(`Failed to fetch announcement: ${response.status}`);
        }
        
        const data: Announcement = await response.json();
        setAnnouncement(data);
        document.title = `${data.title} - RENNSZ Announcements`;
      } catch (error) {
        console.error("Error fetching announcement:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnnouncement();
  }, [id, announcements, navigate]);
  
  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="glass p-8 rounded-lg">
              <p>Loading announcement...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (!announcement) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <div className="glass p-8 rounded-lg">
              <p>Announcement not found. <Link href="/announcements"><a className="text-[#D4AF37] hover:underline">View all announcements</a></Link></p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/announcements">
            <a className="text-[#D4AF37] hover:underline flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Announcements
            </a>
          </Link>
        </div>
        
        <div className="glass rounded-lg p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 md:mb-0 flex items-center">
              {announcement.featured && (
                <FaStar className="text-[#D4AF37] mr-3" />
              )}
              {announcement.title}
            </h1>
            
            <div className="flex items-center text-gray-400">
              <FaCalendar className="mr-2" />
              <span>{format(new Date(announcement.date), 'MMMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-700 my-6"></div>
          
          <div className="prose prose-invert max-w-none">
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="border-t border-gray-700 my-6"></div>
          
          <div className="flex justify-between">
            <Link href="/announcements">
              <a className="text-[#D4AF37] hover:underline flex items-center">
                <FaArrowLeft className="mr-2" /> All Announcements
              </a>
            </Link>
            
            <Link href="/">
              <a className="text-[#D4AF37] hover:underline">
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
