import { useState } from "react";
import { Star, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MOCK_FEEDBACK = [
  { id: "1", user: "Moussa K.", rating: 5, message: "La meilleure radio de la région ! Je l'écoute tous les jours.", date: "2026-03-05" },
  { id: "2", user: "Awa D.", rating: 4, message: "J'adore les émissions culturelles. Continuez comme ça !", date: "2026-03-03" },
  { id: "3", user: "Seydou T.", rating: 5, message: "Depuis l'enfance, cette radio m'accompagne. Merci pour tout.", date: "2026-02-28" },
];

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
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !message.trim()) {
      toast({ title: "Veuillez donner une note et écrire un message.", variant: "destructive" });
      return;
    }
    toast({ title: "Merci pour votre avis ! 🙏" });
    setRating(0);
    setName("");
    setMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2">Donnez votre avis</h1>
        <p className="text-muted-foreground mb-8">Votre feedback nous aide à améliorer Radio Belekandekati.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Form */}
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
            <label className="block text-sm font-medium mb-2">Votre nom (optionnel)</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Anonyme" />
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
          <Button type="submit" className="gap-2 rounded-full w-full">
            <Send className="h-4 w-4" /> Envoyer
          </Button>
          <p className="text-xs text-muted-foreground text-center">Connectez-vous pour poster votre avis.</p>
        </motion.form>

        {/* Existing feedback */}
        <div className="space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Avis des auditeurs
          </h2>
          {MOCK_FEEDBACK.map((fb, i) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{fb.user}</span>
                <span className="text-xs text-muted-foreground">{new Date(fb.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <StarRating rating={fb.rating} />
              <p className="text-sm mt-2 text-muted-foreground">{fb.message}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
