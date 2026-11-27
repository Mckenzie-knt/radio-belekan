// PATCH: désactive les optimisations batterie agressives des constructeurs (Xiaomi/Huawei/Oppo)
async function disablePowerOptimizations() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await BackgroundMode.requestDisableBatteryOptimizations();
  } catch (e) {
    console.warn("Failed to disable battery optimizations", e);
  }
}

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { BackgroundMode } from "@anuradev/capacitor-background-mode";

// Active le service de lecture en arriere-plan (Android/iOS) pour que le flux continue quand l app est minimisee
async function activateBackgroundMode(trackTitle: string) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const perm = await BackgroundMode.checkNotificationsPermission();
    if (perm.notifications === "prompt") {
      await BackgroundMode.requestNotificationsPermission();
    }
    await disablePowerOptimizations();
    await BackgroundMode.enable({
      title: "Radio Belekan de Kati",
      text: trackTitle,
      subText: "Radio Belekan de Kati",
      bigText: true,
      resume: true,
      silent: true,
      hidden: false,
      channelName: "Lecture en cours",
      channelDescription: "Notification de lecture de la radio en arriere-plan",
      allowClose: true,
      closeTitle: "Arreter",
      showWhen: false,
      visibility: "public",
      disableWebViewOptimization: false,
      allowMicrophoneInBackground: false,
    });
  } catch (e) {
    console.warn("BackgroundMode enable failed", e);
  }
}

async function deactivateBackgroundMode() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await BackgroundMode.disable();
  } catch (e) {
    console.warn("BackgroundMode disable failed", e);
  }
}

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