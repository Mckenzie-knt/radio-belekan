import { useState, useEffect, useCallback } from "react";
import { Settings, Upload, Radio, MessageCircle, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

interface Show {
  id: string;
  name: string;
}

interface Episode {
  id: string;
  title: string;
  date: string;
  audio_url: string;
  show_id: string | null;
  show_name?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { setStreamUrl } = useAudio();
  const { toast } = useToast();
  const [streamUrlInput, setStreamUrlInput] = useState("");
  const [shows, setShows] = useState<Show[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [newShowName, setNewShowName] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeShowId, setEpisodeShowId] = useState("");
  const [episodeDate, setEpisodeDate] = useState("");
  const [episodeFile, setEpisodeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const uploadWithProgress = useCallback((fileName: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.statusText}`));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/episodes-audio/${fileName}`;
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.send(file);
    });
  }, []);

  const loadEpisodes = useCallback(async () => {
    const { data } = await supabase
      .from("episodes")
      .select("id, title, date, audio_url, show_id, shows(name)")
      .order("date", { ascending: false });
    if (data) {
      setEpisodes(data.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        date: ep.date,
        audio_url: ep.audio_url,
        show_id: ep.show_id,
        show_name: ep.shows?.name,
      })));
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("radio_config").select("value").eq("key", "stream_url").single().then(({ data }) => {
      if (data) setStreamUrlInput(data.value);
    });
    supabase.from("shows").select("id, name").order("name").then(({ data }) => {
      if (data) setShows(data);
    });
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setContactMessages(data as ContactMessage[]);
    });
    loadEpisodes();
  }, [isAdmin, loadEpisodes]);

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const saveStreamUrl = async () => {
    const { error } = await supabase
      .from("radio_config")
      .update({ value: streamUrlInput, updated_by: user.id })
      .eq("key", "stream_url");
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setStreamUrl(streamUrlInput);
      toast({ title: "URL du flux mise à jour !" });
    }
  };

  const createShow = async () => {
    if (!newShowName.trim()) return;
    const { data, error } = await supabase.from("shows").insert({ name: newShowName.trim() }).select().single();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else if (data) {
      setShows(prev => [...prev, data]);
      setNewShowName("");
      toast({ title: "Émission créée !" });
    }
  };

  const deleteShow = async (id: string) => {
    const { error } = await supabase.from("shows").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setShows(prev => prev.filter(s => s.id !== id));
      toast({ title: "Émission supprimée !" });
    }
  };

  const deleteEpisode = async (ep: Episode) => {
    // Extract storage file name from URL
    const urlParts = ep.audio_url.split("/episodes-audio/");
    if (urlParts[1]) {
      await supabase.storage.from("episodes-audio").remove([decodeURIComponent(urlParts[1])]);
    }
    const { error } = await supabase.from("episodes").delete().eq("id", ep.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setEpisodes(prev => prev.filter(e => e.id !== ep.id));
      toast({ title: "Épisode supprimé !" });
    }
  };

  const uploadEpisode = async () => {
    if (!episodeTitle.trim() || !episodeFile) {
      toast({ title: "Remplissez le titre et le fichier audio.", variant: "destructive" });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const sanitized = episodeFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${sanitized}`;
    try {
      await uploadWithProgress(fileName, episodeFile);
    } catch (err: any) {
      toast({ title: "Erreur d'upload", description: err.message, variant: "destructive" });
      setUploading(false);
      setUploadProgress(0);
      return;
    }
    const { data: urlData } = supabase.storage.from("episodes-audio").getPublicUrl(fileName);
    const { error } = await supabase.from("episodes").insert({
      title: episodeTitle.trim(),
      audio_url: urlData.publicUrl,
      show_id: episodeShowId || null,
      date: episodeDate || new Date().toISOString().split("T")[0],
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Épisode uploadé !" });
      setEpisodeTitle("");
      setEpisodeFile(null);
      setEpisodeDate("");
      loadEpisodes();
    }
    setUploading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Administration
        </h1>
        <p className="text-muted-foreground mb-8">Gérez votre radio, les émissions et les contenus.</p>
      </motion.div>

      <Tabs defaultValue="stream" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="stream" className="gap-2"><Radio className="h-4 w-4" /> Flux Radio</TabsTrigger>
          <TabsTrigger value="shows" className="gap-2"><MessageCircle className="h-4 w-4" /> Émissions</TabsTrigger>
          <TabsTrigger value="episodes" className="gap-2"><Upload className="h-4 w-4" /> Épisodes</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Mail className="h-4 w-4" /> Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl">
            <h2 className="font-display text-xl mb-4">URL du flux radio</h2>
            <p className="text-sm text-muted-foreground mb-4">Modifiez l'URL du flux audio en direct.</p>
            <div className="space-y-4">
              <div>
                <Label>URL du stream</Label>
                <Input value={streamUrlInput} onChange={e => setStreamUrlInput(e.target.value)} placeholder="https://stream.zeno.fm/..." />
              </div>
              <Button onClick={saveStreamUrl} className="rounded-full">Sauvegarder</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shows">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl">
            <h2 className="font-display text-xl mb-4">Créer une émission</h2>
            <div className="flex gap-2">
              <Input value={newShowName} onChange={e => setNewShowName(e.target.value)} placeholder="Nom de l'émission" />
              <Button onClick={createShow} className="rounded-full shrink-0">Créer</Button>
            </div>
            {shows.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Émissions existantes</h3>
                {shows.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">{s.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteShow(s.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="episodes">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl mb-4">Uploader un épisode</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <Label>Titre</Label>
                <Input value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} placeholder="Ex: Matinale du 5 Mars" />
              </div>
              <div>
                <Label>Émission</Label>
                <Select value={episodeShowId} onValueChange={setEpisodeShowId}>
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {shows.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de diffusion</Label>
                <Input type="date" value={episodeDate} onChange={e => setEpisodeDate(e.target.value)} />
              </div>
              <div>
                <Label>Fichier audio</Label>
                <Input type="file" accept="audio/*" onChange={e => setEpisodeFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            {uploading && (
              <div className="mb-4 space-y-1">
                <Progress value={uploadProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-right">{uploadProgress}%</p>
              </div>
            )}
            <Button className="gap-2 rounded-full" onClick={uploadEpisode} disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Upload en cours..." : "Uploader l'épisode"}
            </Button>

            {/* Episodes list */}
            {episodes.length > 0 && (
              <div className="mt-8 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Épisodes existants</h3>
                {episodes.map(ep => (
                  <div key={ep.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ep.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ep.date}{ep.show_name ? ` · ${ep.show_name}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEpisode(ep)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
