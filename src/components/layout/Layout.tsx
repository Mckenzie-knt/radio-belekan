import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AudioPlayer from "./AudioPlayer";
import SponsorBanner from "@/components/sponsors/SponsorBanner";
import SponsorFooter from "@/components/sponsors/SponsorFooter";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SponsorBanner />
      <Navbar />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <SponsorFooter />
      <AudioPlayer />
    </div>
  );
}
