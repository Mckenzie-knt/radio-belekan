import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  subject: z.string().trim().min(1, "Le sujet est requis").max(200),
  message: z.string().trim().min(1, "Le message est requis").max(2000),
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert([{
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
    }]);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message envoyé ! 📩", description: "Nous vous répondrons dans les plus brefs délais." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl mb-2">Contact & Support</h1>
        <p className="text-muted-foreground mb-8">Une question ? Un problème ? Contactez-nous !</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom</label>
            <Input value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Votre nom" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="votre@email.com" />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sujet</label>
            <Input value={form.subject} onChange={e => handleChange("subject", e.target.value)} placeholder="Objet de votre message" />
            {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <Textarea value={form.message} onChange={e => handleChange("message", e.target.value)} placeholder="Décrivez votre demande..." rows={5} />
            {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
          </div>
          <Button type="submit" className="gap-2 rounded-full w-full" disabled={loading}>
            <Send className="h-4 w-4" /> Envoyer le message
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <h2 className="font-display text-xl">Nos coordonnées</h2>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <a href="mailto:contact@radiobelekandekati.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  contact@radiobelekandekati.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Téléphone</p>
                <p className="text-sm text-muted-foreground">+223 XX XX XX XX</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-sm text-muted-foreground">Bamako, Mali</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-xl mb-3">Horaires</h2>
            <p className="text-sm text-muted-foreground">
              Notre équipe est disponible du lundi au vendredi, de 8h à 18h (GMT).
              Nous répondons généralement sous 24 heures.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
