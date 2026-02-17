"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type CarouselProps = {
  children: React.ReactNode;
  autoPlay?: boolean;
  intervalMs?: number;
  showIndicators?: boolean;
  itemsPerView?: number;
};

export default function Carousel({ children, autoPlay = true, intervalMs = 5000, showIndicators = true, itemsPerView = 1 }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const slides = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [index, setIndex] = useState<number>(0); // page index
  const pages = Math.max(1, Math.ceil(slides.length / itemsPerView));

  const scrollToIndex = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const target = el.clientWidth * i;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth;
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % pages;
        scrollToIndex(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, intervalMs, pages]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center z-10">
        <button 
          aria-label="Prev" 
          onClick={() => scroll("left")} 
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center z-10">
        <button 
          aria-label="Next" 
          onClick={() => scroll("right")} 
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          ›
        </button>
      </div>
      <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar">
        {slides.map((child, i) => (
          <div
            key={i}
            className="snap-start px-2"
            style={{ minWidth: `${100 / itemsPerView}%`, width: `${100 / itemsPerView}%` }}
          >
            {child}
          </div>
        ))}
      </div>
      {showIndicators && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "bg-white w-8" : "bg-white/30 w-2 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
