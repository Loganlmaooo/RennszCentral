import { Link } from "wouter";
import { FaTwitch, FaTwitter, FaInstagram, FaDiscord, FaHeart } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="glass py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/">
              <a className="text-2xl font-bold font-montserrat gold-gradient">RENNSZ</a>
            </Link>
            <p className="text-gray-400 mt-2">Premium Streaming Experience</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <Link href="/#home">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">Home</a>
            </Link>
            <Link href="/#streams">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">Streams</a>
            </Link>
            <Link href="/#announcements">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">Announcements</a>
            </Link>
            <Link href="/#about">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">About</a>
            </Link>
            <Link href="/#contact">
              <a className="text-gray-300 hover:text-[#D4AF37] transition-colors">Contact</a>
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://www.twitch.tv/rennsz" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#9146FF] transition-colors">
              <FaTwitch />
            </a>
            <a href="https://x.com/rennsz96?s=21" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com/rennsz?igsh=MWhjYjg2ZDV4dHc0bw==" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
              <FaInstagram />
            </a>
            <a href="https://discord.gg/hUTXCaSdKC" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
              <FaDiscord />
            </a>
          </div>
        </div>
        
        <hr className="border-gray-800 my-6" />
        
        <div className="text-center text-gray-400 text-sm">
          <p>
            Made with <FaHeart className="text-red-500 inline mx-1" /> by sf.xen on discord
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} RENNSZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
