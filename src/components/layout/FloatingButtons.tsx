import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site";
import { MessageCircle, Send } from "lucide-react";

export function FloatingButtons() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { fetchSiteSettings().then(setS); }, []);

  const wa = (s?.whatsapp_number ?? "").replace(/[^\d]/g, "");
  const tg = s?.telegram_username ?? "";
  const waMsg = encodeURIComponent("Hi ChanAidRecovery, I'd like to discuss recovering funds I lost to a scam.");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {tg && (
        <a
          href={`https://t.me/${tg}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on Telegram"
          className="relative h-14 w-14 flex items-center justify-center group"
        >
          {/* pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-[#229ED9] animate-ping opacity-30 pointer-events-none" />
          <span className="relative h-14 w-14 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-200">
            <Send className="w-6 h-6" />
          </span>
        </a>
      )}
      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="relative h-14 w-14 flex items-center justify-center group"
        >
          {/* pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
          <span className="relative h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-200">
            <MessageCircle className="w-6 h-6" />
          </span>
        </a>
      )}
    </div>
  );
}
