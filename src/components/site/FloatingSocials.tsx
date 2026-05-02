import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";
import { ChatPreviews } from "./ChatPreviews";

export function FloatingSocials() {
  const [activeChat, setActiveChat] = useState<"whatsapp" | "telegram" | null>(null);

  const toggleChat = (type: "whatsapp" | "telegram") => {
    setActiveChat(activeChat === type ? null : type);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Telegram */}
        <button
          onClick={() => toggleChat("telegram")}
          aria-label="Contact on Telegram"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#0088cc] text-white rounded-full shadow-lg hover:scale-110 transition-all hover:shadow-[#0088cc]/40"
        >
          <Send className="w-6 h-6" />
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Telegram Chat
          </span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => toggleChat("whatsapp")}
          aria-label="Contact on WhatsApp"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-all hover:shadow-[#25D366]/40"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp Support
          </span>
        </button>
      </div>

      <ChatPreviews 
        type="whatsapp" 
        isOpen={activeChat === "whatsapp"} 
        onClose={() => setActiveChat(null)} 
        phoneNumber={CONTACT_INFO.PHONE}
      />
      
      <ChatPreviews 
        type="telegram" 
        isOpen={activeChat === "telegram"} 
        onClose={() => setActiveChat(null)} 
        username={CONTACT_INFO.TELEGRAM?.split('/').pop()}
      />
    </>
  );
}
