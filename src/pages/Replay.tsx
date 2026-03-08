import { useState } from "react";
import { Play, Pause, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/contexts/AudioContext";
import { motion } from "framer-motion";

// Mock data — sera remplacé par Lovable Cloud
const SHOWS = ["Toutes", "Matinale", "Débat du Soir", "Culture & Tradition", "Musique Non-Stop"];

const EPISODES = [
  { id: "1", title: "Matinale du 5 Mars", show: "Matinale", date: "2026-03-05", url: "" },
  { id: "2", title: "Débat: L'éducation rurale", show: "Débat du Soir", date: "2026-03-04", url: "" },
  { id: "3", title: "Culture & Tradition - Ep 45", show: "Culture & Tradition", date: "2026-03-03", url: "" },
  { id: "4", title: "Matinale du 3 Mars", show: "Matinale", date: "2026-03-03", url: "" },
  { id: "5", title: "Musique Non-Stop Weekend", show: "Musique Non-Stop", date: "2026-03-01", url: "" },
  { id: "6", title: "Débat: Agriculture moderne", show: "Débat du Soir", date: "2026-02-28", url: "" },
];

export default function Replay() {
  const [selectedShow, setSelectedShow] = useState("Toutes");
  const [search, setSearch] = useState("");
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

  const filtered = EPISODES.filter(ep => {
    const matchShow = selectedShow === "Toutes" || ep.show === selectedShow;
    const matchSearch = ep.title.toLowerCase().includes(search.toLowerCase());
    return matchShow && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2">Émissions en Replay</h1>
        <p className="text-muted-foreground mb-8">Retrouvez toutes les émissions passées de Radio Belekandekati.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une émission..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SHOWS.map(s => (
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

      {/* Episodes list */}
      <div className="space-y-3">
        {filtered.map((ep, i) => {
          const isCurrent = currentTrack?.title === ep.title;
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
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playTrack({ title: ep.title, show: ep.show, url: ep.url });
                  }
                }}
              >
                {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{ep.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{ep.show}</Badge>
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
