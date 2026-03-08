import { useState, useEffect } from "react";
import { Play, Pause, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/contexts/AudioContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Episode {
  id: string;
  title: string;
  audio_url: string;
  date: string;
  duration: number | null;
  show_id: string | null;
  shows?: { name: string } | null;
}

export default function Replay() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [shows, setShows] = useState<string[]>([]);
  const [selectedShow, setSelectedShow] = useState("Toutes");
  const [search, setSearch] = useState("");
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  useEffect(() => {
    const load = async () => {
      const { data: episodeData } = await supabase
        .from("episodes")
        .select("*, shows(name)")
        .order("date", { ascending: false });
      if (episodeData) {
        setEpisodes(episodeData as any);
        const showNames = [...new Set(episodeData.map((e: any) => e.shows?.name).filter(Boolean))] as string[];
        setShows(showNames);
      }
    };
    load();
  }, []);

  const filtered = episodes.filter(ep => {
    const showName = ep.shows?.name || "";
    const matchShow = selectedShow === "Toutes" || showName === selectedShow;
    const matchSearch = ep.title.toLowerCase().includes(search.toLowerCase());
    return matchShow && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2">Émissions en Replay</h1>
        <p className="text-muted-foreground mb-8">Retrouvez toutes les émissions passées de Radio Belekandekati.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une émission..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Toutes", ...shows].map(s => (
            <Badge
              key={s}
              variant={selectedShow === s ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
              onClick={() => setSelectedShow(s)}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ep, i) => {
          const isCurrent = currentTrack?.url === ep.audio_url;
          const showName = ep.shows?.name || "Émission";
          return (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isCurrent ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/20"
              }`}
            >
              <Button
                size="icon"
                variant={isCurrent && isPlaying ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else playTrack({ title: ep.title, show: showName, url: ep.audio_url });
                }}
              >
                {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{ep.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{showName}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ep.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucune émission trouvée.</p>
        )}
      </div>
    </div>
  );
}
