import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Megaphone, Send, CheckCircle, Users, Radio, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  company: z.string().trim().min(1, "Entreprise requise").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().max(30).optional(),
  message: z.string().trim().min(10, "Décrivez votre projet (min 10 caractères)").max(2000),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Annonceurs() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("sponsor_requests").insert({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      budget: data.budget || null,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  const features = [
    { icon: Radio, title: "Diffusion 24/7", desc: "Votre marque diffusée en continu auprès de notre audience fidèle." },
    { icon: Users, title: "Audience engagée", desc: "Une communauté active qui interagit en direct avec la radio." },
    { icon: BarChart3, title: "Formats flexibles", desc: "Bannières, spots audio, sponsoring d'émissions — à vous de choisir." },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
        <Megaphone className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Devenez Partenaire</h1>
        <p className="text-muted-foreground text-lg">
          Associez votre marque à Radio Belekandekati et touchez notre audience en direct.
        </p>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-lg mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl mb-2">Demande envoyée !</h2>
              <p className="text-muted-foreground">Nous vous recontacterons dans les plus brefs délais.</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl mb-6">Contactez-nous</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom complet *</Label>
                    <Input {...register("name")} placeholder="Votre nom" />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>Entreprise *</Label>
                    <Input {...register("company")} placeholder="Nom de l'entreprise" />
                    {errors.company && <p className="text-xs text-destructive mt-1">{errors.company.message}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" {...register("email")} placeholder="email@exemple.com" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input {...register("phone")} placeholder="+223 ..." />
                  </div>
                </div>
                <div>
                  <Label>Budget estimé</Label>
                  <Select onValueChange={(v) => setValue("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 50 000 FCFA">{"< 50 000 FCFA"}</SelectItem>
                      <SelectItem value="50 000 - 200 000 FCFA">50 000 - 200 000 FCFA</SelectItem>
                      <SelectItem value="200 000 - 500 000 FCFA">200 000 - 500 000 FCFA</SelectItem>
                      <SelectItem value="> 500 000 FCFA">{"> 500 000 FCFA"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Votre projet *</Label>
                  <Textarea {...register("message")} rows={4} placeholder="Décrivez votre besoin publicitaire, le type de partenariat souhaité..." />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                </div>
                <Button type="submit" className="w-full gap-2 rounded-full" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
