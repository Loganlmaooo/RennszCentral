import { FaBroadcastTower, FaGamepad, FaCalendarAlt, FaTwitch } from "react-icons/fa";
import { useStreams } from "@/hooks/useStreams";

export function StreamChannels() {
  const { streamChannels } = useStreams();
  
  if (!streamChannels || streamChannels.length === 0) {
    return (
      <section id="streams" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>Loading stream channels...</p>
          </div>
        </div>
      </section>
    );
  }
  
  const mainChannel = streamChannels.find(channel => channel.isMain);
  const secondaryChannel = streamChannels.find(channel => !channel.isMain);
  
  return (
    <section id="streams" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
            <span className="gold-gradient">Premium</span> Channels
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Experience high-quality content across multiple streams, from real-life adventures to immersive gaming sessions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Channel */}
          {mainChannel && (
            <div className="glass rounded-lg overflow-hidden transition-all duration-300 card-hover">
              <div className="h-64 overflow-hidden relative">
                {/* The IRL streaming image could be replaced with a screenshot or placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 800 500" className="w-full h-full object-cover">
                  <rect width="100%" height="100%" fill="#222" />
                  <circle cx="400" cy="250" r="150" fill="#333" />
                  <path d="M300,200 L500,300 L300,400 Z" fill="#D4AF37" />
                </svg>
                
                <div className="absolute top-4 left-4 bg-red-600 text-white rounded-full px-4 py-1 text-sm font-medium flex items-center">
                  <FaBroadcastTower className="mr-2" /> Main Channel
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{mainChannel.displayName}</h3>
                <p className="text-gray-300 mb-4">
                  Join the real-life adventures across cities, events, and unique experiences. High-quality IRL streaming with community interaction.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-[#D4AF37] mr-1"><FaCalendarAlt /></span>
                    <span className="text-sm text-gray-400">{mainChannel.schedule}</span>
                  </div>
                  <a 
                    href={mainChannel.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#9146FF] rounded flex items-center text-sm hover:bg-opacity-90 transition-all"
                  >
                    <FaTwitch className="mr-2" /> Watch
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Secondary Channel */}
          {secondaryChannel && (
            <div className="glass rounded-lg overflow-hidden transition-all duration-300 card-hover">
              <div className="h-64 overflow-hidden relative">
                {/* The gaming streams image could be replaced with a screenshot or placeholder */}
                <svg width="100%" height="100%" viewBox="0 0 800 500" className="w-full h-full object-cover">
                  <rect width="100%" height="100%" fill="#222" />
                  <rect x="300" y="150" width="200" height="200" fill="#333" />
                  <rect x="350" y="200" width="100" height="100" fill="#D4AF37" />
                </svg>
                
                <div className="absolute top-4 left-4 bg-purple-600 text-white rounded-full px-4 py-1 text-sm font-medium flex items-center">
                  <FaGamepad className="mr-2" /> Gaming Channel
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{secondaryChannel.displayName}</h3>
                <p className="text-gray-300 mb-4">
                  Relaxed gaming sessions, community interaction, and casual conversations. Experience gameplay across various titles in a laid-back atmosphere.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-[#D4AF37] mr-1"><FaCalendarAlt /></span>
                    <span className="text-sm text-gray-400">{secondaryChannel.schedule}</span>
                  </div>
                  <a 
                    href={secondaryChannel.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#9146FF] rounded flex items-center text-sm hover:bg-opacity-90 transition-all"
                  >
                    <FaTwitch className="mr-2" /> Watch
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
