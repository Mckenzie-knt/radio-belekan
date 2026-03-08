import { useActiveSponsors } from "@/hooks/useSponsors";
import { ExternalLink } from "lucide-react";

export default function SponsorFooter() {
  const { sponsors, loading } = useActiveSponsors("footer");

  if (loading || sponsors.length === 0) return null;

  return (
    <section className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">Nos partenaires</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {sponsors.map(s => (
            <a
              key={s.id}
              href={s.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
              title={s.name}
            >
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                  {s.name}
                  <ExternalLink className="h-3 w-3" />
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
