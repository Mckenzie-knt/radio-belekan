import { useState, useEffect } from "react";
import { Star, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackItem {
  id: string;
  rating: number;
  message: string | null;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`h-5 w-5 transition-colors ${s <= rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:text-secondary" : ""}`}
          onClick={() => interactive && onRate?.(s)}
        />
      ))}
    </div>
  );
}

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("feedbacks")
        .select("*, profiles!feedbacks_user_id_fkey(display_name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setFeedbacks(data as any);
    };
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Connectez-vous pour poster un avis", variant: "destructive" });
      return;
    }
    if (rating === 0 || !message.trim()) {
      toast({ title: "Veuillez donner une note et écrire un message.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("feedbacks").insert({ user_id: user.id, rating, message: message.trim() });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Merci pour votre avis ! 🙏" });
      setRating(0);
      setMessage("");
      // Refresh
      const { data } = await supabase
        .from("feedbacks")
        .select("*, profiles!feedbacks_user_id_fkey(display_name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setFeedbacks(data as any);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2">Donnez votre avis</h1>
        <p className="text-muted-foreground mb-8">Votre feedback nous aide à améliorer Radio Belekandekati.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Votre note</label>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Votre message</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Partagez votre expérience avec Radio Belekandekati..."
              rows={4}
            />
          </div>
          <Button type="submit" className="gap-2 rounded-full w-full" disabled={loading}>
            <Send className="h-4 w-4" /> Envoyer
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              <a href="/auth" className="text-primary hover:underline">Connectez-vous</a> pour poster votre avis.
            </p>
          )}
        </motion.form>

        <div className="space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Avis des auditeurs
          </h2>
          {feedbacks.length === 0 && (
            <p className="text-muted-foreground text-center py-8">Aucun avis pour le moment. Soyez le premier !</p>
          )}
          {feedbacks.map((fb, i) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{fb.profiles?.display_name || "Anonyme"}</span>
                <span className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <StarRating rating={fb.rating} />
              {fb.message && <p className="text-sm mt-2 text-muted-foreground">{fb.message}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
