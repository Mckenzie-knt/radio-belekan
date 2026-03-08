import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AudioState {
  isPlaying: boolean;
  isLive: boolean;
  volume: number;
  currentTrack: { title: string; show?: string; url: string } | null;
  streamUrl: string;
  currentTime: number;
  duration: number;
}

interface AudioContextType extends AudioState {
  playLive: () => void;
  playTrack: (track: { title: string; show?: string; url: string }) => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setStreamUrl: (url: string) => void;
  seek: (time: number) => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

const DEFAULT_STREAM = "https://stream.zeno.fm/khzf1fg4muhvv";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLive: false,
    volume: 0.8,
    currentTrack: null,
    streamUrl: DEFAULT_STREAM,
    currentTime: 0,
    duration: 0,
  });

  // Load stream URL from database
  useEffect(() => {
    supabase
      .from("radio_config")
      .select("value")
      .eq("key", "stream_url")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setState(s => ({ ...s, streamUrl: data.value }));
        }
      });
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
    };
    const onLoadedMetadata = () => {
      setState(s => ({ ...s, duration: audio.duration || 0 }));
    };
    const onDurationChange = () => {
      setState(s => ({ ...s, duration: audio.duration || 0 }));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.pause();
    };
  }, []);

  const playLive = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = state.streamUrl;
    audio.play();
    setState(s => ({ ...s, isPlaying: true, isLive: true, currentTime: 0, duration: 0, currentTrack: { title: "En Direct", url: s.streamUrl } }));
  }, [state.streamUrl]);

  const playTrack = useCallback((track: { title: string; show?: string; url: string }) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.url;
    audio.play();
    setState(s => ({ ...s, isPlaying: true, isLive: false, currentTime: 0, duration: 0, currentTrack: track }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (state.currentTrack) {
      audioRef.current?.play();
      setState(s => ({ ...s, isPlaying: true }));
    } else {
      playLive();
    }
  }, [state.isPlaying, state.currentTrack, pause, playLive]);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const setStreamUrl = useCallback((url: string) => {
    setState(s => ({ ...s, streamUrl: url }));
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState(s => ({ ...s, currentTime: time }));
  }, []);

  return (
    <AudioCtx.Provider value={{ ...state, playLive, playTrack, pause, togglePlay, setVolume, setStreamUrl, seek }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
