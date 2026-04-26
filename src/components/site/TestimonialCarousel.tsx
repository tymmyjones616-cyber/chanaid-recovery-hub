import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star } from "lucide-react";
import { TiltCard } from "@/components/effects/TiltCard";

interface Testimonial {
  id: string;
  rating: number;
  quote: string;
  client_name: string;
  location: string;
  amount_recovered?: string;
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const intervalId = setInterval(scrollNext, 3000);
    return () => clearInterval(intervalId);
  }, [scrollNext]);

  return (
    <div className="embla overflow-hidden" ref={emblaRef}>
      <div className="embla__container flex">
        {testimonials.map((t) => (
          <div key={t.id} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-3">
            <TiltCard className="rounded-2xl h-full" intensity={7}>
              <div className="bg-white rounded-2xl p-8 border border-border shadow-soft h-full flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-lg italic text-foreground/90 leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
                  <div>
                    <div className="font-bold text-base">{t.client_name}</div>
                    <div className="text-sm text-muted-foreground">{t.location}</div>
                  </div>
                  {t.amount_recovered && (
                    <div className="text-lg font-black text-gradient bg-clip-text text-transparent bg-cta-gradient">
                      {t.amount_recovered}
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
