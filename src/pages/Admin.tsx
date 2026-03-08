import { useState, useEffect } from "react";
import { Settings, Upload, Radio, MessageCircle, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { setStreamUrl } = useAudio();
  const { toast } = useToast();
  const [streamUrlInput, setStreamUrlInput] = useState("");
  const [shows, setShows] = useState<Show[]>([]);
  const [newShowName, setNewShowName] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeShowId, setEpisodeShowId] = useState("");
  const [episodeDate, setEpisodeDate] = useState("");
  const [episodeFile, setEpisodeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    // Load stream URL
    supabase.from("radio_config").select("value").eq("key", "stream_url").single().then(({ data }) => {
      if (data) setStreamUrlInput(data.value);
    });
    // Load shows
    supabase.from("shows").select("id, name").order("name").then(({ data }) => {
      if (data) setShows(data);
    });
  }, [isAdmin]);

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

  const uploadEpisode = async () => {
    if (!episodeTitle.trim() || !episodeFile) {
      toast({ title: "Remplissez le titre et le fichier audio.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}-${episodeFile.name}`;
    const { error: uploadError } = await supabase.storage.from("episodes-audio").upload(fileName, episodeFile);
    if (uploadError) {
      toast({ title: "Erreur d'upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
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
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">{s.name}</span>
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
            <Button className="gap-2 rounded-full" onClick={uploadEpisode} disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Upload en cours..." : "Uploader l'épisode"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
