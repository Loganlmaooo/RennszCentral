import { useEffect, useState, useRef } from "react";
import { FaTwitch, FaDiscord, FaBroadcastTower, FaUser, FaBullhorn } from "react-icons/fa";
import { useStreams } from "@/hooks/useStreams";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { format } from "date-fns";

export function HeroSection() {
  const { streamSettings, streamChannels, streamStatus } = useStreams();
  const { featuredAnnouncement } = useAnnouncements();
  const [featuredChannel, setFeaturedChannel] = useState<string | null>(null);
  
  useEffect(() => {
    if (streamSettings && streamChannels) {
      if (streamSettings.autoDetect && streamStatus) {
        // Check if any channel is live
        const liveChannel = Object.entries(streamStatus).find(
          ([_, status]) => status.isLive
        );
        
        if (liveChannel) {
          setFeaturedChannel(liveChannel[0]);
          return;
        }
      }
      
      // Fallback to configured featured channel
      setFeaturedChannel(streamSettings.featuredChannel);
    }
  }, [streamSettings, streamChannels, streamStatus]);
  
  const currentLiveStatus = featuredChannel && streamStatus?.[featuredChannel];
  const formattedDate = featuredAnnouncement ? format(new Date(featuredAnnouncement.date), 'MMMM d, yyyy') : '';
  
  return (
    <section id="home" className="min-h-[80vh] flex items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-black opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-2/5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat mb-6">
              Welcome to <span className="gold-gradient">RENNSZ</span> Official
            </h1>
            <p className="text-lg opacity-90 mb-8">
              Experience premium IRL and gaming content with the community. Join the adventure with top-tier streams and exclusive announcements.
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="https://www.twitch.tv/rennsz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#9146FF] rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center"
              >
                <FaTwitch className="mr-2" /> Follow on Twitch
              </a>
              <a 
                href="https://discord.gg/hUTXCaSdKC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-medium transition-all flex items-center"
              >
                <FaDiscord className="mr-2" /> Join Discord
              </a>
            </div>
            
            {/* Live Indicator */}
            <div className="mt-8 flex items-center">
              {featuredChannel && (
                <>
                  <span className="flex items-center">
                    <span className="flex h-3 w-3 relative mr-2">
                      {currentLiveStatus?.isLive ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                      )}
                    </span>
                    <span className={`font-medium ${currentLiveStatus?.isLive ? 'text-red-400' : 'text-gray-400'}`}>
                      {currentLiveStatus?.isLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </span>
                  <span className="mx-3 text-gray-400">|</span>
                  <span className="text-gray-300">
                    <FaUser className="inline mr-1" /> {currentLiveStatus?.viewers || '--'}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="lg:w-3/5 glass rounded-lg overflow-hidden gold-border h-96 md:h-[500px] w-full">
            {featuredChannel ? (
              currentLiveStatus?.isLive ? (
                <iframe 
                  src={`https://player.twitch.tv/?channel=${featuredChannel}&parent=${window.location.hostname}&autoplay=true&muted=true`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen={true}
                  title="Twitch Stream"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <FaBroadcastTower className="text-5xl text-[#D4AF37] mb-4 mx-auto" />
                    <h3 className="text-xl font-medium mb-2">Stream Offline</h3>
                    <p className="text-gray-400">The stream is currently offline. Check back later or subscribe for notifications.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-gray-400">Loading stream...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Current announcement banner */}
        {featuredAnnouncement && (
          <div className="mt-10 glass rounded-lg p-6 border-l-4 border-[#D4AF37]">
            <div className="flex items-start">
              <div className="text-[#D4AF37] mr-4 text-3xl">
                <FaBullhorn />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-1 gold-gradient">Latest Announcement</h3>
                <p className="text-gray-300">{featuredAnnouncement.content}</p>
                <div className="mt-2 text-sm text-gray-400">
                  Posted on <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
