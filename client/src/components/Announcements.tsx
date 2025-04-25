import { Link } from "wouter";
import { format } from "date-fns";
import { FaStar, FaGem, FaGift, FaArrowRight } from "react-icons/fa";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export function Announcements() {
  const { announcements, isLoading } = useAnnouncements();
  
  const displayAnnouncements = announcements?.slice(0, 3) || [];
  
  const iconMap = [<FaStar key="star" />, <FaGem key="gem" />, <FaGift key="gift" />];
  
  return (
    <section id="announcements" className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
            <span className="gold-gradient">Announcements</span> & Updates
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Stay up to date with the latest news, stream schedules, and special events.
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading announcements...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {displayAnnouncements.map((announcement, index) => (
                <div key={announcement.id} className="glass rounded-lg p-6 transition-all duration-300 card-hover">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[#D4AF37] text-xl">
                      {iconMap[index % iconMap.length]}
                    </span>
                    <span className="text-sm text-gray-400">
                      {format(new Date(announcement.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{announcement.title}</h3>
                  <p className="text-gray-300 mb-4">
                    {announcement.content.length > 120 
                      ? `${announcement.content.substring(0, 120)}...` 
                      : announcement.content}
                  </p>
                  <Link href={`/announcements/${announcement.id}`}>
                    <a className="text-[#D4AF37] hover:underline inline-flex items-center">
                      Read more <FaArrowRight className="ml-2 text-sm" />
                    </a>
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link href="/announcements">
                <a className="inline-block px-6 py-3 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-primary transition-all font-medium">
                  View All Announcements
                </a>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
