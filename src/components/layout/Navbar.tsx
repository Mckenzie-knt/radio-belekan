import { Link, useLocation } from "react-router-dom";
import { Radio, Headphones, MessageCircle, Menu, X, LogOut, Shield, Mail, Megaphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import radioLogo from "@/assets/radio-logo.png";

const links = [
  { to: "/", label: "En Direct", icon: Radio },
  { to: "/replay", label: "Replay", icon: Headphones },
  { to: "/live-chat", label: "Live Chat", icon: MessageCircle },
  { to: "/feedback", label: "Avis", icon: MessageCircle },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/annonceurs", label: "Annonceurs", icon: Megaphone },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={radioLogo} alt="Radio Belekandekati" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-lg tracking-tight hidden sm:block">Belekandekati</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}>
              <Button variant={pathname === l.to ? "default" : "ghost"} size="sm" className="gap-2">
                <l.icon className="h-4 w-4" />
                {l.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{profile?.display_name || user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">Connexion</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {links.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                  <Button variant={pathname === l.to ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <l.icon className="h-4 w-4" />
                    {l.label}
                  </Button>
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Shield className="h-4 w-4" /> Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => { signOut(); setOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
