import { useActiveSponsors } from "@/hooks/useSponsors";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SponsorBanner() {
  const { sponsors, loading } = useActiveSponsors("banner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % sponsors.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [sponsors.length]);

  if (loading || sponsors.length === 0 || dismissed) return null;

  const sponsor = sponsors[currentIndex];

  return (
    <div className="relative bg-primary/10 border-b border-primary/20">
      <a
        href={sponsor.website_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="container mx-auto px-4 py-2 flex items-center justify-center gap-3"
      >
        {sponsor.banner_url ? (
          <img src={sponsor.banner_url} alt={sponsor.name} className="h-8 md:h-10 w-auto object-contain" />
        ) : (
          <>
            {sponsor.logo_url && <img src={sponsor.logo_url} alt="" className="h-6 w-auto" />}
            <span className="text-sm text-foreground">
              <span className="text-xs text-muted-foreground mr-1">Sponsorisé par</span>
              <span className="font-medium">{sponsor.name}</span>
              {sponsor.description && <span className="text-muted-foreground ml-1 hidden sm:inline">— {sponsor.description}</span>}
            </span>
          </>
        )}
      </a>
      <button
        onClick={(e) => { e.preventDefault(); setDismissed(true); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
