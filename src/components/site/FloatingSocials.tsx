import { MessageCircle, Send } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";

const GENERAL_MESSAGE = "Hi ChanAid Recovery, I'm visiting your website and I would like to inquire about a fund recovery case. Can you help me?";

export function FloatingSocials() {
  const whatsappUrl = `${CONTACT_INFO.WHATSAPP}?text=${encodeURIComponent(GENERAL_MESSAGE)}`;
  const telegramUrl = `${CONTACT_INFO.TELEGRAM}?text=${encodeURIComponent(GENERAL_MESSAGE)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on Telegram"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#0088cc] text-white rounded-full shadow-lg hover:scale-110 transition-all hover:shadow-[#0088cc]/40"
      >
        <Send className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Telegram {CONTACT_INFO.TELEGRAM.split('/').pop()}
        </span>
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-all hover:shadow-[#25D366]/40"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          WhatsApp {CONTACT_INFO.PHONE}
        </span>
      </a>
    </div>
  );
}
