import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import radioLogo from "@/assets/radio-logo.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/");
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Connecté !" });
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password, name || email);
      if (error) {
        toast({ title: "Erreur d'inscription", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <img src={radioLogo} alt="" className="w-16 h-16 mx-auto mb-4 rounded-xl" />
            <h1 className="font-display text-2xl">{isLogin ? "Connexion" : "Inscription"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Connectez-vous pour interagir" : "Créez votre compte auditeur"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label>Nom</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.com" required />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Pas de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
