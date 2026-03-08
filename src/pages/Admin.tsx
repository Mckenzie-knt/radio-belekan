import { useState, useEffect, useCallback } from "react";
import { Settings, Upload, Radio, MessageCircle, Trash2, Mail, Megaphone, Plus, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

interface Show { id: string; name: string; }
interface Episode { id: string; title: string; date: string; audio_url: string; show_id: string | null; show_name?: string; }
interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; created_at: string; }
interface Sponsor {
  id: string; name: string; description: string | null; logo_url: string | null; banner_url: string | null;
  audio_url: string | null; website_url: string | null; position: string; is_active: boolean;
  starts_at: string; expires_at: string | null; created_at: string;
}
interface SponsorRequest {
  id: string; name: string; company: string; email: string; phone: string | null;
  message: string; budget: string | null; created_at: string;
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
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorRequests, setSponsorRequests] = useState<SponsorRequest[]>([]);

  // Sponsor form state
  const [spName, setSpName] = useState("");
  const [spDesc, setSpDesc] = useState("");
  const [spWebsite, setSpWebsite] = useState("");
  const [spPosition, setSpPosition] = useState("footer");
  const [spStartsAt, setSpStartsAt] = useState("");
  const [spExpiresAt, setSpExpiresAt] = useState("");
  const [spLogoFile, setSpLogoFile] = useState<File | null>(null);
  const [spBannerFile, setSpBannerFile] = useState<File | null>(null);
  const [spAudioFile, setSpAudioFile] = useState<File | null>(null);

  const uploadWithProgress = useCallback((fileName: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error(`Upload failed: ${xhr.statusText}`)); };
      xhr.onerror = () => reject(new Error("Network error"));
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/episodes-audio/${fileName}`;
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.send(file);
    });
  }, []);

  const loadEpisodes = useCallback(async () => {
    const { data } = await supabase.from("episodes").select("id, title, date, audio_url, show_id, shows(name)").order("date", { ascending: false });
    if (data) setEpisodes(data.map((ep: any) => ({ id: ep.id, title: ep.title, date: ep.date, audio_url: ep.audio_url, show_id: ep.show_id, show_name: ep.shows?.name })));
  }, []);

  const loadSponsors = useCallback(async () => {
    const { data } = await supabase.from("sponsors").select("*").order("created_at", { ascending: false });
    if (data) setSponsors(data as Sponsor[]);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("radio_config").select("value").eq("key", "stream_url").single().then(({ data }) => { if (data) setStreamUrlInput(data.value); });
    supabase.from("shows").select("id, name").order("name").then(({ data }) => { if (data) setShows(data); });
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setContactMessages(data as ContactMessage[]); });
    supabase.from("sponsor_requests").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setSponsorRequests(data as SponsorRequest[]); });
    loadEpisodes();
    loadSponsors();
  }, [isAdmin, loadEpisodes, loadSponsors]);

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const saveStreamUrl = async () => {
    const { error } = await supabase.from("radio_config").update({ value: streamUrlInput, updated_by: user.id }).eq("key", "stream_url");
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { setStreamUrl(streamUrlInput); toast({ title: "URL du flux mise à jour !" }); }
  };

  const createShow = async () => {
    if (!newShowName.trim()) return;
    const { data, error } = await supabase.from("shows").insert({ name: newShowName.trim() }).select().single();
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else if (data) { setShows(prev => [...prev, data]); setNewShowName(""); toast({ title: "Émission créée !" }); }
  };

  const deleteShow = async (id: string) => {
    const { error } = await supabase.from("shows").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { setShows(prev => prev.filter(s => s.id !== id)); toast({ title: "Émission supprimée !" }); }
  };

  const deleteEpisode = async (ep: Episode) => {
    const urlParts = ep.audio_url.split("/episodes-audio/");
    if (urlParts[1]) await supabase.storage.from("episodes-audio").remove([decodeURIComponent(urlParts[1])]);
    const { error } = await supabase.from("episodes").delete().eq("id", ep.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { setEpisodes(prev => prev.filter(e => e.id !== ep.id)); toast({ title: "Épisode supprimé !" }); }
  };

  const uploadEpisode = async () => {
    if (!episodeTitle.trim() || !episodeFile) { toast({ title: "Remplissez le titre et le fichier audio.", variant: "destructive" }); return; }
    setUploading(true); setUploadProgress(0);
    const sanitized = episodeFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${sanitized}`;
    try { await uploadWithProgress(fileName, episodeFile); } catch (err: any) { toast({ title: "Erreur d'upload", description: err.message, variant: "destructive" }); setUploading(false); setUploadProgress(0); return; }
    const { data: urlData } = supabase.storage.from("episodes-audio").getPublicUrl(fileName);
    const { error } = await supabase.from("episodes").insert({ title: episodeTitle.trim(), audio_url: urlData.publicUrl, show_id: episodeShowId || null, date: episodeDate || new Date().toISOString().split("T")[0] });
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Épisode uploadé !" }); setEpisodeTitle(""); setEpisodeFile(null); setEpisodeDate(""); loadEpisodes(); }
    setUploading(false);
  };

  // --- Sponsor helpers ---
  const uploadSponsorFile = async (file: File, prefix: string): Promise<string> => {
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${prefix}/${Date.now()}-${sanitized}`;
    const { error } = await supabase.storage.from("sponsors-assets").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("sponsors-assets").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createSponsor = async () => {
    if (!spName.trim()) { toast({ title: "Nom du sponsor requis", variant: "destructive" }); return; }
    setUploading(true);
    try {
      let logo_url: string | null = null;
      let banner_url: string | null = null;
      let audio_url: string | null = null;
      if (spLogoFile) logo_url = await uploadSponsorFile(spLogoFile, "logos");
      if (spBannerFile) banner_url = await uploadSponsorFile(spBannerFile, "banners");
      if (spAudioFile) audio_url = await uploadSponsorFile(spAudioFile, "audio");

      const { error } = await supabase.from("sponsors").insert({
        name: spName.trim(),
        description: spDesc.trim() || null,
        website_url: spWebsite.trim() || null,
        position: spPosition,
        starts_at: spStartsAt || new Date().toISOString(),
        expires_at: spExpiresAt || null,
        logo_url, banner_url, audio_url,
      });
      if (error) throw error;
      toast({ title: "Sponsor créé !" });
      setSpName(""); setSpDesc(""); setSpWebsite(""); setSpStartsAt(""); setSpExpiresAt("");
      setSpLogoFile(null); setSpBannerFile(null); setSpAudioFile(null);
      loadSponsors();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const toggleSponsorActive = async (sp: Sponsor) => {
    const { error } = await supabase.from("sponsors").update({ is_active: !sp.is_active }).eq("id", sp.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { setSponsors(prev => prev.map(s => s.id === sp.id ? { ...s, is_active: !s.is_active } : s)); }
  };

  const deleteSponsor = async (id: string) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { setSponsors(prev => prev.filter(s => s.id !== id)); toast({ title: "Sponsor supprimé !" }); }
  };

  const positionLabels: Record<string, string> = { footer: "Pied de page", banner: "Bannière haut", player: "Lecteur audio" };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" /> Administration
        </h1>
        <p className="text-muted-foreground mb-8">Gérez votre radio, les émissions et les contenus.</p>
      </motion.div>

      <Tabs defaultValue="stream" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="stream" className="gap-2"><Radio className="h-4 w-4" /> Flux</TabsTrigger>
          <TabsTrigger value="shows" className="gap-2"><MessageCircle className="h-4 w-4" /> Émissions</TabsTrigger>
          <TabsTrigger value="episodes" className="gap-2"><Upload className="h-4 w-4" /> Épisodes</TabsTrigger>
          <TabsTrigger value="sponsors" className="gap-2"><Megaphone className="h-4 w-4" /> Sponsors</TabsTrigger>
          <TabsTrigger value="messages" className="gap-2"><Mail className="h-4 w-4" /> Messages</TabsTrigger>
        </TabsList>

        {/* Stream tab */}
        <TabsContent value="stream">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl">
            <h2 className="font-display text-xl mb-4">URL du flux radio</h2>
            <p className="text-sm text-muted-foreground mb-4">Modifiez l'URL du flux audio en direct.</p>
            <div className="space-y-4">
              <div><Label>URL du stream</Label><Input value={streamUrlInput} onChange={e => setStreamUrlInput(e.target.value)} placeholder="https://stream.zeno.fm/..." /></div>
              <Button onClick={saveStreamUrl} className="rounded-full">Sauvegarder</Button>
            </div>
          </div>
        </TabsContent>

        {/* Shows tab */}
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
                    <Button variant="ghost" size="icon" onClick={() => deleteShow(s.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Episodes tab */}
        <TabsContent value="episodes">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl mb-4">Uploader un épisode</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div><Label>Titre</Label><Input value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)} placeholder="Ex: Matinale du 5 Mars" /></div>
              <div><Label>Émission</Label><Select value={episodeShowId} onValueChange={setEpisodeShowId}><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger><SelectContent>{shows.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date de diffusion</Label><Input type="date" value={episodeDate} onChange={e => setEpisodeDate(e.target.value)} /></div>
              <div><Label>Fichier audio</Label><Input type="file" accept="audio/*" onChange={e => setEpisodeFile(e.target.files?.[0] || null)} /></div>
            </div>
            {uploading && <div className="mb-4 space-y-1"><Progress value={uploadProgress} className="h-3" /><p className="text-sm text-muted-foreground text-right">{uploadProgress}%</p></div>}
            <Button className="gap-2 rounded-full" onClick={uploadEpisode} disabled={uploading}><Upload className="h-4 w-4" /> {uploading ? "Upload en cours..." : "Uploader l'épisode"}</Button>
            {episodes.length > 0 && (
              <div className="mt-8 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Épisodes existants</h3>
                {episodes.map(ep => (
                  <div key={ep.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{ep.title}</p><p className="text-xs text-muted-foreground">{ep.date}{ep.show_name ? ` · ${ep.show_name}` : ""}</p></div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEpisode(ep)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Sponsors tab */}
        <TabsContent value="sponsors">
          <div className="space-y-6">
            {/* Create sponsor form */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Ajouter un sponsor</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div><Label>Nom *</Label><Input value={spName} onChange={e => setSpName(e.target.value)} placeholder="Nom du sponsor" /></div>
                <div><Label>Site web</Label><Input value={spWebsite} onChange={e => setSpWebsite(e.target.value)} placeholder="https://..." /></div>
                <div><Label>Position d'affichage</Label>
                  <Select value={spPosition} onValueChange={setSpPosition}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="footer">Pied de page (logos)</SelectItem>
                      <SelectItem value="banner">Bannière en haut</SelectItem>
                      <SelectItem value="player">Lecteur audio (pré-roll)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Input value={spDesc} onChange={e => setSpDesc(e.target.value)} placeholder="Courte description" /></div>
                <div><Label>Date de début</Label><Input type="datetime-local" value={spStartsAt} onChange={e => setSpStartsAt(e.target.value)} /></div>
                <div><Label>Date d'expiration</Label><Input type="datetime-local" value={spExpiresAt} onChange={e => setSpExpiresAt(e.target.value)} /></div>
                <div><Label>Logo (image)</Label><Input type="file" accept="image/*" onChange={e => setSpLogoFile(e.target.files?.[0] || null)} /></div>
                <div><Label>Bannière (image)</Label><Input type="file" accept="image/*" onChange={e => setSpBannerFile(e.target.files?.[0] || null)} /></div>
                <div className="sm:col-span-2"><Label>Spot audio (pré-roll)</Label><Input type="file" accept="audio/*" onChange={e => setSpAudioFile(e.target.files?.[0] || null)} /></div>
              </div>
              <Button onClick={createSponsor} disabled={uploading} className="gap-2 rounded-full">
                <Plus className="h-4 w-4" /> {uploading ? "Création..." : "Créer le sponsor"}
              </Button>
            </div>

            {/* Sponsors list */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="font-display text-xl mb-4">Sponsors ({sponsors.length})</h2>
              {sponsors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun sponsor pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {sponsors.map(sp => {
                    const expired = sp.expires_at && new Date(sp.expires_at) < new Date();
                    return (
                      <div key={sp.id} className={`p-4 rounded-lg border ${expired ? "border-destructive/30 bg-destructive/5" : sp.is_active ? "border-primary/20 bg-primary/5" : "border-border bg-muted/50"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {sp.logo_url && <img src={sp.logo_url} alt={sp.name} className="h-10 w-10 rounded-lg object-contain bg-background p-1" />}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{sp.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{positionLabels[sp.position] || sp.position}</span>
                                {expired && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Expiré</span>}
                              </div>
                              {sp.description && <p className="text-xs text-muted-foreground mt-0.5">{sp.description}</p>}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>Début: {new Date(sp.starts_at).toLocaleDateString("fr-FR")}</span>
                                {sp.expires_at && <span>Fin: {new Date(sp.expires_at).toLocaleDateString("fr-FR")}</span>}
                                {sp.website_url && <a href={sp.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Site</a>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5" title={sp.is_active ? "Actif" : "Inactif"}>
                              {sp.is_active ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                              <Switch checked={sp.is_active} onCheckedChange={() => toggleSponsorActive(sp)} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteSponsor(sp.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sponsor requests */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="font-display text-xl mb-4">Demandes d'annonceurs ({sponsorRequests.length})</h2>
              {sponsorRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {sponsorRequests.map(req => (
                    <div key={req.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{req.name}</span>
                            <span className="text-xs text-muted-foreground">({req.company})</span>
                            <span className="text-xs text-muted-foreground">{req.email}</span>
                          </div>
                          {req.phone && <p className="text-xs text-muted-foreground">{req.phone}</p>}
                          {req.budget && <p className="text-xs text-primary font-medium mt-1">Budget: {req.budget}</p>}
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{req.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          const { error } = await supabase.from("sponsor_requests").delete().eq("id", req.id);
                          if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
                          else { setSponsorRequests(prev => prev.filter(r => r.id !== req.id)); toast({ title: "Demande supprimée !" }); }
                        }} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Messages tab */}
        <TabsContent value="messages">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl mb-4">Messages de contact</h2>
            {contactMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {contactMessages.map(msg => (
                  <div key={msg.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{msg.name}</span>
                          <span className="text-xs text-muted-foreground">{msg.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(msg.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="text-sm font-medium mt-2">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        const { error } = await supabase.from("contact_messages").delete().eq("id", msg.id);
                        if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
                        else { setContactMessages(prev => prev.filter(m => m.id !== msg.id)); toast({ title: "Message supprimé !" }); }
                      }} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
