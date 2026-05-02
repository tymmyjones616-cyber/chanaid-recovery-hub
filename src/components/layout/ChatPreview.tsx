import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCheck, Smile, Paperclip } from "lucide-react";

interface ChatPreviewProps {
  type: "whatsapp" | "telegram";
  title: string;
  subtitle: string;
  avatar: string;
  agentName: string;
  message: string;
  actionUrl: string;
  onClose: () => void;
}

export function ChatPreview({ 
  type, 
  title, 
  subtitle, 
  avatar, 
  agentName, 
  message, 
  actionUrl, 
  onClose 
}: ChatPreviewProps) {
  const brandColor = type === "whatsapp" ? "#25D366" : "#229ED9";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-20 right-0 w-[320px] sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
    >
      {/* Header */}
      <div 
        className="px-5 py-4 flex items-center justify-between text-white"
        style={{ backgroundColor: brandColor }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold overflow-hidden border border-white/30">
              <img src={avatar} alt={agentName} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none">{title}</div>
            <div className="text-[10px] opacity-90 mt-1 uppercase tracking-widest font-bold">{subtitle}</div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="p-4 bg-[#f0f2f5] min-h-[180px] flex flex-col gap-4">
        <div className="self-center bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Today
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col gap-1 max-w-[85%]">
          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative">
            <div className="text-[10px] font-bold text-slate-400 mb-1">{agentName}</div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end mt-1 items-center gap-1">
              <span className="text-[9px] text-slate-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <CheckCheck className="w-3 h-3 text-sky-400" />
            </div>
            
            {/* Bubble Tail */}
            <div className="absolute -left-2 top-0 w-3 h-3 bg-white" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
          </div>
        </div>
      </div>

      {/* Input Area (Fake) */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-3">
        <div className="flex gap-2 text-slate-400">
          <Smile className="w-5 h-5 cursor-pointer hover:text-slate-600 transition-colors" />
          <Paperclip className="w-5 h-5 cursor-pointer hover:text-slate-600 transition-colors" />
        </div>
        <div className="flex-1 h-9 bg-slate-50 border border-slate-100 rounded-full px-4 flex items-center text-slate-400 text-xs">
          Type your message...
        </div>
        <a 
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-lg"
          style={{ backgroundColor: brandColor }}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </a>
      </div>

      {/* Call to Action */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <a 
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 shadow-md"
          style={{ backgroundColor: brandColor }}
        >
          Start Conversation
        </a>
      </div>
    </motion.div>
  );
}
