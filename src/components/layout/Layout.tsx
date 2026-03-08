import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AudioPlayer from "./AudioPlayer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <AudioPlayer />
    </div>
  );
}
