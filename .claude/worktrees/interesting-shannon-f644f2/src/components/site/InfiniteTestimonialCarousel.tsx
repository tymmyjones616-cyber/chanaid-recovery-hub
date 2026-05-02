import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { TiltCard } from "@/components/effects/TiltCard";

interface Testimonial {
  id: string;
  rating: number;
  quote: string;
  clientName?: string;
  client_name?: string;
  location: string;
  amountRecovered?: string;
  amount_recovered?: string;
}

function getInitials(name?: string) {
  if (!name) return "CR";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function InfiniteTestimonialCarousel({ 
  testimonials, 
  speed = 1, 
  direction = "forward",
  pauseOnInteraction = false 
}: { 
  testimonials: Testimonial[];
  speed?: number;
  direction?: "forward" | "backward";
  pauseOnInteraction?: boolean;
}) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
    },
    [
      AutoScroll({ 
        speed, 
        stopOnInteraction: pauseOnInteraction,
        startDelay: 0,
        direction: direction === "forward" ? "forward" : "backward"
      })
    ]
  );

  return (
    <div className="relative group">
      {/* Edge Gradient Masks for Premium Look */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {testimonials.map((t) => (
            <div key={t.id} className="embla__slide flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_30%] min-w-0 px-3 py-6">
              <TiltCard className="h-full rounded-3xl" intensity={4}>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft h-full flex flex-col justify-between relative overflow-hidden group/card hover:border-primary/20 transition-colors duration-500">
                  {/* Subtle Background Accent */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover/card:bg-primary/10 transition-colors" />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-6 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50/50 border border-emerald-100/50 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3 fill-emerald-100" />
                    Verified Case
                  </div>

                  <Quote className="absolute top-12 right-8 w-12 h-12 text-slate-50 group-hover/card:text-primary/5 transition-colors duration-500" />
                  
                  <div className="relative z-10 pt-6">
                    <div className="flex gap-0.5 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < t.rating ? "fill-primary text-primary" : "text-slate-100"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-[1.05rem] font-medium text-slate-700 leading-relaxed italic">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-cta-gradient flex items-center justify-center text-white font-black text-sm shadow-soft shrink-0 border-2 border-white">
                        {getInitials(t.clientName || t.client_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-1 leading-none text-[0.95rem] truncate">
                          {t.clientName || t.client_name}
                        </div>
                        <div className="text-[0.8rem] text-muted-foreground mt-1.5 truncate">{t.location}</div>
                      </div>
                    </div>
                    {(t.amountRecovered || t.amount_recovered) && (
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold mb-1">Recovered</div>
                        <div className="text-lg font-black text-gradient bg-clip-text text-transparent bg-cta-gradient leading-none">
                          {t.amountRecovered || t.amount_recovered}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
