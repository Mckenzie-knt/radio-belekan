import { useState, useEffect } from "react";
import { Send, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const REACTIONS = ["👍", "❤️", "🔥", "😂", "👏"];

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

export default function LiveChat() {
  const { isPlaying, isLive, playLive } = useAudio();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*, profiles!chat_messages_user_id_fkey(display_name)")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as any);
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel("chat-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", payload.new.user_id)
          .single();
        const newMsg = { ...payload.new, profiles: profile } as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load reaction counts
  useEffect(() => {
    const loadReactions = async () => {
      const { data } = await supabase.from("chat_reactions").select("emoji");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
        setReactions(counts);
      }
    };
    loadReactions();

    const channel = supabase
      .channel("chat-reactions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_reactions" }, (payload) => {
        setReactions(prev => ({ ...prev, [payload.new.emoji]: (prev[payload.new.emoji] || 0) + 1 }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    const { error } = await supabase.from("chat_messages").insert({ user_id: user.id, message: message.trim() });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setMessage("");
  };

  const sendReaction = async (emoji: string) => {
    if (!user) {
      toast({ title: "Connectez-vous pour réagir", variant: "destructive" });
      return;
    }
    await supabase.from("chat_reactions").insert({ user_id: user.id, emoji });
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl md:text-4xl">Espace Live</h1>
              {isPlaying && isLive && (
                <span className="flex items-center gap-1.5 bg-live text-live-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-live-foreground live-pulse" />
                  En Direct
                </span>
              )}
            </div>
            <p className="text-muted-foreground">Discutez avec les autres auditeurs et réagissez en direct.</p>
          </motion.div>

          {!(isPlaying && isLive) && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Radio className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">Écoutez en direct</h3>
              <p className="text-muted-foreground mb-4">Lancez le direct pour participer au chat et aux réactions.</p>
              <Button onClick={playLive} className="gap-2 rounded-full">
                <Radio className="h-4 w-4" /> Écouter en direct
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2">Réactions rapides :</span>
            {REACTIONS.map(emoji => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.4 }}
                onClick={() => sendReaction(emoji)}
                className="text-2xl hover:scale-110 transition-transform relative"
              >
                {emoji}
                {reactions[emoji] && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {reactions[emoji]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl flex flex-col h-[500px] lg:h-[600px]">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Chat en direct</span>
            <span className="ml-auto text-xs text-muted-foreground">{messages.length} messages</span>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {(msg.profiles?.display_name || "?")[0]}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{msg.profiles?.display_name || "Anonyme"}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            {user ? (
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input
                  placeholder="Votre message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                <a href="/auth" className="text-primary hover:underline">Connectez-vous</a> pour participer au chat.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
