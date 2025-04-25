import { useState } from "react";
import { Link } from "wouter";
import { FaTwitch, FaTwitter, FaInstagram, FaDiscord, FaBars, FaTimes } from "react-icons/fa";

interface HeaderProps {
  isMobile: boolean;
  onLoginClick: () => void;
}

export function Header({ isMobile, onLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="glass fixed w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-2xl font-bold font-montserrat gold-gradient">RENNSZ</a>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/#home">
            <a className="nav-item font-medium transition-all duration-300">Home</a>
          </Link>
          <Link href="/#streams">
            <a className="nav-item font-medium transition-all duration-300">Streams</a>
          </Link>
          <Link href="/#announcements">
            <a className="nav-item font-medium transition-all duration-300">Announcements</a>
          </Link>
          <Link href="/#about">
            <a className="nav-item font-medium transition-all duration-300">About</a>
          </Link>
          <Link href="/#contact">
            <a className="nav-item font-medium transition-all duration-300">Contact</a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <a href="https://www.twitch.tv/rennsz" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#9146FF] transition-colors">
            <FaTwitch />
          </a>
          <a href="https://x.com/rennsz96?s=21" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-blue-400 transition-colors">
            <FaTwitter />
          </a>
          <a href="https://www.instagram.com/rennsz?igsh=MWhjYjg2ZDV4dHc0bw==" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-pink-500 transition-colors">
            <FaInstagram />
          </a>
          <a href="https://discord.gg/hUTXCaSdKC" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-indigo-400 transition-colors">
            <FaDiscord />
          </a>
          
          {isMobile && (
            <button onClick={toggleMobileMenu} className="md:hidden text-xl">
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          
          <button 
            onClick={onLoginClick}
            className="hidden sm:block px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-primary font-semibold transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
          >
            Admin Login
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass absolute w-full py-4 px-4">
          <div className="flex flex-col space-y-4">
            <Link href="/#home">
              <a className="font-medium" onClick={toggleMobileMenu}>Home</a>
            </Link>
            <Link href="/#streams">
              <a className="font-medium" onClick={toggleMobileMenu}>Streams</a>
            </Link>
            <Link href="/#announcements">
              <a className="font-medium" onClick={toggleMobileMenu}>Announcements</a>
            </Link>
            <Link href="/#about">
              <a className="font-medium" onClick={toggleMobileMenu}>About</a>
            </Link>
            <Link href="/#contact">
              <a className="font-medium" onClick={toggleMobileMenu}>Contact</a>
            </Link>
            <button 
              onClick={() => {
                onLoginClick();
                toggleMobileMenu();
              }}
              className="self-start px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-primary font-semibold"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
