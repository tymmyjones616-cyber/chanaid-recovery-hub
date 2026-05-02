import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, User, CheckCheck } from "lucide-react";

interface ChatBoxProps {
  type: "whatsapp" | "telegram";
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  username?: string;
}

export function ChatPreviews({ type, isOpen, onClose, phoneNumber = "+1234567890", username = "ChanAidRecovery" }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    const url = type === "whatsapp" 
      ? `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`
      : `https://t.me/${username}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setMessage("");
    onClose();
  };

  const config = {
    whatsapp: {
      title: "WhatsApp Chat",
      color: "bg-[#25D366]",
      headerColor: "bg-[#075E54]",
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      placeholder: "Type a message...",
      status: "Online",
      bubbleColor: "bg-[#DCF8C6]",
    },
    telegram: {
      title: "Telegram Chat",
      color: "bg-[#0088cc]",
      headerColor: "bg-[#24A1DE]",
      icon: <Send className="w-5 h-5 text-white" />,
      placeholder: "Write a message...",
      status: "online",
      bubbleColor: "bg-[#EFFDFF]",
    }
  };

  const s = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
          className="fixed bottom-24 right-6 z-[100] w-[350px] overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-200"
        >
          {/* Header */}
          <div className={`${s.headerColor} p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{type === "whatsapp" ? "Support Desk" : "ChanAid Official"}</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {s.status}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="h-[300px] bg-[#E5DDD5] p-4 overflow-y-auto flex flex-col gap-3" style={{ backgroundImage: type === 'whatsapp' ? 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' : 'none', backgroundSize: 'contain' }}>
            <div className="self-start max-w-[80%] bg-white p-3 rounded-lg rounded-tl-none shadow-sm relative">
              <p className="text-sm text-slate-800">Hello! 👋 How can we help you with your recovery case today?</p>
              <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">{time}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={s.placeholder}
              className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button 
              onClick={handleSend}
              className={`${s.headerColor} w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all`}
            >
              <Send className="w-5 h-5 text-white ml-0.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
