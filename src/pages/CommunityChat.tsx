import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type ChatMessage = Tables<"chat_messages">;

export default function CommunityChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const userState = profile?.state;
  const userDistrict = profile?.district;

  const fetchMessages = async () => {
    let query = supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(200);
    // Filter by user's location for location-specific chat
    if (userState) query = query.eq("state", userState);
    if (userDistrict) query = query.eq("district", userDistrict);
    const { data } = await query;
    setMessages(data ?? []);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase.channel("chat").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      (payload) => {
        const newMsg = payload.new as ChatMessage;
        // Only add if it matches user's location
        if (userState && newMsg.state !== userState) return;
        if (userDistrict && newMsg.district !== userDistrict) return;
        setMessages((prev) => [...prev, newMsg]);
      }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userState, userDistrict]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !user) { if (!user) toast.error("Please login to chat"); return; }
    if (!userState || !userDistrict) {
      toast.error("Please set your location in the dashboard first");
      return;
    }
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      sender_name: profile?.full_name || "Anonymous",
      text: text.trim(),
      avatar_url: profile?.profile_photo_url,
      state: userState,
      district: userDistrict,
    });
    if (error) toast.error("Failed to send");
    setText("");
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="py-8 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Community Chat</h1>
          <p className="text-muted-foreground">Chat with local drivers and riders</p>
        </div>
        {userState && userDistrict && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {userDistrict}, {userState}
          </span>
        )}
      </div>

      {!userState || !userDistrict ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground flex-1 flex items-center justify-center flex-col">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Set your location first</p>
          <p className="text-sm mt-1">Go to Dashboard and save your state & district to join your local chat room.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No messages yet in {userDistrict}, {userState}. Be the first to say hi! 👋</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={msg.avatar_url ?? ""} />
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground">{getInitials(msg.sender_name)}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className={`text-xs font-medium mb-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.sender_name}</p>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-4 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={user ? "Type a message..." : "Login to chat..."}
              className="flex-1"
              disabled={!user}
            />
            <Button onClick={send} className="gradient-primary text-primary-foreground" size="icon" disabled={!user}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
