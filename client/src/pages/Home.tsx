import { useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { StreamChannels } from "@/components/StreamChannels";
import { Announcements } from "@/components/Announcements";
import { SocialMedia } from "@/components/SocialMedia";
import { Contact } from "@/components/Contact";

export default function Home() {
  // Set page title
  useEffect(() => {
    document.title = "RENNSZ - Premium Streaming Hub";
  }, []);

  return (
    <>
      <HeroSection />
      <StreamChannels />
      <Announcements />
      <SocialMedia />
      <Contact />
    </>
  );
}
