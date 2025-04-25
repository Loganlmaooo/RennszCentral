import { FaTwitch, FaTwitter, FaInstagram, FaDiscord } from "react-icons/fa";

export function SocialMedia() {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
            <span className="gold-gradient">Connect</span> With RENNSZ
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join the community across multiple platforms and stay connected with all the latest content.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <a 
            href="https://www.twitch.tv/rennsz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <FaTwitch className="text-4xl text-[#9146FF] mb-4 mx-auto" />
            <h3 className="font-semibold mb-1">Twitch</h3>
            <p className="text-sm text-gray-400">@rennsz</p>
          </a>
          
          <a 
            href="https://x.com/rennsz96?s=21" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-400/20"
          >
            <FaTwitter className="text-4xl text-blue-400 mb-4 mx-auto" />
            <h3 className="font-semibold mb-1">Twitter</h3>
            <p className="text-sm text-gray-400">@rennsz96</p>
          </a>
          
          <a 
            href="https://www.instagram.com/rennsz?igsh=MWhjYjg2ZDV4dHc0bw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-pink-500/20"
          >
            <FaInstagram className="text-4xl text-pink-500 mb-4 mx-auto" />
            <h3 className="font-semibold mb-1">Instagram</h3>
            <p className="text-sm text-gray-400">@rennsz</p>
          </a>
          
          <a 
            href="https://discord.gg/hUTXCaSdKC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass rounded-lg p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-indigo-400/20"
          >
            <FaDiscord className="text-4xl text-indigo-400 mb-4 mx-auto" />
            <h3 className="font-semibold mb-1">Discord</h3>
            <p className="text-sm text-gray-400">RENNSZ Community</p>
          </a>
        </div>
        
        <div className="mt-12 glass rounded-lg overflow-hidden gold-border">
          <div className="grid md:grid-cols-2">
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 gold-gradient">Join Our Community</h3>
              <p className="text-gray-300 mb-6">
                Become part of our growing community on Discord. Chat with other fans, get stream notifications, and participate in exclusive events.
              </p>
              <a 
                href="https://discord.gg/hUTXCaSdKC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="self-start px-6 py-3 bg-indigo-600 rounded font-medium hover:bg-indigo-700 transition-all flex items-center w-max"
              >
                <FaDiscord className="mr-2" /> Join Discord Server
              </a>
            </div>
            <div className="hidden md:block relative h-64 md:h-auto">
              {/* Using SVG for discord community graphic */}
              <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
                <rect width="100%" height="100%" fill="#5865F2" opacity="0.2" />
                <circle cx="400" cy="300" r="150" fill="#5865F2" opacity="0.3" />
                <path d="M250,200 C300,150 500,150 550,200 C600,250 600,350 550,400 C500,450 300,450 250,400 C200,350 200,250 250,200 Z" fill="#5865F2" opacity="0.5" />
              </svg>
              <div className="absolute inset-0 bg-indigo-900 bg-opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
