import { Play, Radio, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import radioLogo from "@/assets/radio-logo.png";

export default function Index() {
  const { isPlaying, isLive, playLive, togglePlay } = useAudio();

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative text-secondary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto">
            
            <motion.img
              src={radioLogo}
              alt="Radio Belekandekati"
              className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-3xl shadow-2xl shadow-primary/30"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }} />
            

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tight mb-4">
              Radio{" "}
              <span className="text-primary">Belekan de kati</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Votre radio, votre culture, votre musique. Écoutez en direct ou retrouvez vos émissions préférées en replay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={isPlaying && isLive ? togglePlay : playLive}
                className="gap-3 text-lg px-8 py-6 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                
                {isPlaying && isLive ?
                <>
                    <span className="w-3 h-3 rounded-full bg-primary-foreground live-pulse" />
                    En cours d'écoute...
                  </> :

                <>
                    <Play className="h-5 w-5" />
                    Écouter en direct
                  </>
                }
              </Button>
              <Link to="/replay">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-3 text-lg px-8 py-6 rounded-full w-full">
                  
                  <Headphones className="h-5 w-5" />
                  Replay
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
          {
            icon: Radio,
            title: "En Direct 24/7",
            desc: "Écoutez Radio Belekandekati en streaming live, où que vous soyez."
          },
          {
            icon: Headphones,
            title: "Émissions en Replay",
            desc: "Retrouvez toutes vos émissions préférées en rediffusion, organisées par thème."
          },
          {
            icon: Users,
            title: "Communauté Active",
            desc: "Interagissez en direct avec les animateurs et les autres auditeurs."
          }].
          map((f, i) =>
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-colors group">
            
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>);

}