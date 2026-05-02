import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";
import { MessageCircle, Send } from "lucide-react";
import { ChatPreview } from "./ChatPreview";
import { AnimatePresence } from "framer-motion";

export function FloatingButtons() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [activeChat, setActiveChat] = useState<"whatsapp" | "telegram" | null>(null);

  useEffect(() => { 
    fetchSiteSettings().then(setS); 
  }, []);

  const wa = (s?.whatsapp_number ?? "").replace(/[^\d]/g, "");
  const tg = (s?.telegram_username ?? "").replace("@", "");
  const waMsg = encodeURIComponent("Hi ChanAidRecovery, I'd like to discuss recovering funds I lost to a scam.");
  const waUrl = `https://wa.me/${wa}?text=${waMsg}`;
  const tgUrl = `https://t.me/${tg}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {activeChat === "telegram" && (
          <ChatPreview
            type="telegram"
            title="Telegram Support"
            subtitle="Online"
            agentName="ChanAid Recovery"
            avatar="https://api.dicebear.com/7.x/bottts/svg?seed=chan-tg"
            message="Hello! Our Telegram specialists are ready to review your case forensics. Send us a message to start."
            actionUrl={tgUrl}
            onClose={() => setActiveChat(null)}
          />
        )}
        {activeChat === "whatsapp" && (
          <ChatPreview
            type="whatsapp"
            title="WhatsApp Support"
            subtitle="Typically replies in minutes"
            agentName="Sarah from ChanAid"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-wa"
            message="Hi there! I'm here to help you understand the recovery process and check if your funds are still recoverable. Want to chat?"
            actionUrl={waUrl}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        {tg && (
          <button
            onClick={() => setActiveChat(activeChat === "telegram" ? null : "telegram")}
            aria-label="Chat on Telegram"
            className="relative h-14 w-14 flex items-center justify-center group"
          >
            <span className="absolute inset-0 rounded-full bg-[#229ED9] animate-ping opacity-20 pointer-events-none" />
            <span className={`relative h-14 w-14 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-elegant transition-all duration-300 ${activeChat === "telegram" ? "scale-110 rotate-12" : "group-hover:scale-110"}`}>
              <Send className="w-6 h-6" />
            </span>
          </button>
        )}
        {wa && (
          <button
            onClick={() => setActiveChat(activeChat === "whatsapp" ? null : "whatsapp")}
            aria-label="Chat on WhatsApp"
            className="relative h-14 w-14 flex items-center justify-center group"
          >
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
            <span className={`relative h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-elegant transition-all duration-300 ${activeChat === "whatsapp" ? "scale-110 -rotate-12" : "group-hover:scale-110"}`}>
              <MessageCircle className="w-6 h-6" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
