import { useState } from "react";
import { Settings, Upload, Radio, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [streamUrl, setStreamUrl] = useState("https://stream.zeno.fm/yn65fsaurfhvv");
  const { toast } = useToast();

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
          <TabsTrigger value="episodes" className="gap-2"><Upload className="h-4 w-4" /> Émissions</TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2"><MessageCircle className="h-4 w-4" /> Modération</TabsTrigger>
          <TabsTrigger value="admins" className="gap-2"><Users className="h-4 w-4" /> Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-xl">
            <h2 className="font-display text-xl mb-4">URL du flux radio</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Modifiez l'URL du flux audio en direct. Actuellement connecté à Zeno FM.
            </p>
            <div className="space-y-4">
              <div>
                <Label>URL du stream</Label>
                <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://stream.zeno.fm/..." />
              </div>
              <Button onClick={() => toast({ title: "URL mise à jour !" })} className="rounded-full">
                Sauvegarder
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="episodes">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl mb-4">Gestion des émissions</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Uploadez des émissions en rediffusion pour vos auditeurs.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <Label>Titre de l'émission</Label>
                <Input placeholder="Ex: Matinale du 5 Mars" />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input placeholder="Ex: Matinale" />
              </div>
              <div>
                <Label>Date de diffusion</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Fichier audio</Label>
                <Input type="file" accept="audio/*" />
              </div>
            </div>
            <Button className="gap-2 rounded-full">
              <Upload className="h-4 w-4" /> Uploader l'émission
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="moderation">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl mb-2">Modération</h2>
            <p className="text-muted-foreground">La modération sera disponible une fois le backend connecté.</p>
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl mb-2">Gestion des administrateurs</h2>
            <p className="text-muted-foreground">La gestion des admins sera disponible une fois le backend connecté.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
