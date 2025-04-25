import { useEffect } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function AllAnnouncements() {
  const { announcements, isLoading } = useAnnouncements();
  
  // Set page title
  useEffect(() => {
    document.title = "All Announcements - RENNSZ";
  }, []);
  
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <a className="text-[#D4AF37] hover:underline flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Home
            </a>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-montserrat mb-4">
            <span className="gold-gradient">Announcements</span> & Updates
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Stay up to date with the latest news, stream schedules, and special events from RENNSZ.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="glass p-8 rounded-lg">
              <p>Loading announcements...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="glass rounded-lg p-6 transition-all duration-300 card-hover">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {announcement.featured && (
                        <span className="text-[#D4AF37] mr-2 text-xl">
                          <FaStar />
                        </span>
                      )}
                      <h2 className="text-2xl font-semibold">{announcement.title}</h2>
                    </div>
                    <span className="text-sm text-gray-400">
                      {format(new Date(announcement.date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-6">
                    {announcement.content.length > 300 
                      ? `${announcement.content.substring(0, 300)}...` 
                      : announcement.content}
                  </p>
                  
                  <Link href={`/announcements/${announcement.id}`}>
                    <a className="text-[#D4AF37] hover:underline inline-flex items-center">
                      Read more <FaArrowRight className="ml-2 text-sm" />
                    </a>
                  </Link>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center">
                <p className="text-gray-400">No announcements found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
