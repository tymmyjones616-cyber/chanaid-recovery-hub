import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 2 },
        "(min-width: 1024px)": { slidesToScroll: 3 },
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, playOnInit: true })]
  );

  return (
    <div className="embla overflow-hidden px-4" ref={emblaRef}>
      <div className="embla__container flex -ml-4">
        {testimonials.map((t) => (
          <div key={t.id} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 py-4">
            <TiltCard className="rounded-[2rem] h-full" intensity={5}>
              <div className="bg-white rounded-[2rem] p-8 border border-border shadow-soft h-full flex flex-col justify-between relative overflow-hidden group">
                {/* Decorative Quote Icon */}
                <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-50 group-hover:text-primary/5 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-primary text-primary" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-[1.05rem] font-medium text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-cta-gradient flex items-center justify-center text-white font-bold text-sm shadow-soft">
                      {getInitials(t.clientName || t.client_name)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                        {t.clientName || t.client_name}
                        <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" title="Verified Recovery" />
                      </div>
                      <div className="text-[0.8rem] text-muted-foreground mt-1">{t.location}</div>
                    </div>
                  </div>
                  {t.amount_recovered && (
                    <div className="text-right">
                      <div className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Recovered</div>
                      <div className="text-lg font-black text-gradient bg-clip-text text-transparent bg-cta-gradient">
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
  );
}
