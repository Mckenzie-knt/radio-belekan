import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioPlayer() {
  const { isPlaying, isLive, currentTrack, volume, togglePlay, playLive, setVolume } = useAudio();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-player text-player-foreground border-t border-border/20 backdrop-blur-xl"
    >
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        {/* Live indicator / Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isPlaying && isLive && (
            <span className="flex items-center gap-1.5 bg-live text-live-foreground px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-live-foreground live-pulse" />
              Live
            </span>
          )}
          {isPlaying && !isLive && currentTrack && (
            <div className="audio-wave">
              <span /><span /><span /><span /><span />
            </div>
          )}
          <div className="truncate">
            <p className="font-semibold text-sm truncate">
              {currentTrack?.title || "Radio Belekandekati"}
            </p>
            {currentTrack?.show && (
              <p className="text-xs opacity-70 truncate">{currentTrack.show}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isLive && (
            <Button
              variant="ghost"
              size="icon"
              onClick={playLive}
              className="text-player-foreground hover:text-primary hover:bg-primary/10"
              title="Écouter en direct"
            >
              <Radio className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play className="h-5 w-5 ml-0.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-player-foreground hover:text-primary hover:bg-primary/10"
          >
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v / 100)}
            className="flex-1"
          />
        </div>
      </div>
    </motion.div>
  );
}
