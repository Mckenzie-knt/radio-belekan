import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

interface AudioState {
  isPlaying: boolean;
  isLive: boolean;
  volume: number;
  currentTrack: { title: string; show?: string; url: string } | null;
  streamUrl: string;
}

interface AudioContextType extends AudioState {
  playLive: () => void;
  playTrack: (track: { title: string; show?: string; url: string }) => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setStreamUrl: (url: string) => void;
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
  });

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = state.volume;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const playLive = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = state.streamUrl;
    audio.play();
    setState(s => ({ ...s, isPlaying: true, isLive: true, currentTrack: { title: "En Direct", url: s.streamUrl } }));
  }, [state.streamUrl]);

  const playTrack = useCallback((track: { title: string; show?: string; url: string }) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.url;
    audio.play();
    setState(s => ({ ...s, isPlaying: true, isLive: false, currentTrack: track }));
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

  return (
    <AudioCtx.Provider value={{ ...state, playLive, playTrack, pause, togglePlay, setVolume, setStreamUrl }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
