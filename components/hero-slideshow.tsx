"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  src: string;
  caption: string;
  tag: string;
}

interface Props {
  slides: Slide[];
}

export function HeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFading(false);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border bg-white shadow-2xl sm:aspect-square">
      {/* All images stacked, only current visible */}
      {slides.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.tag}
          fill
          className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
          sizes="(max-width: 768px) 100vw, 400px"
        />
      ))}

      {/* Dark gradient bottom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Tag pill — top left */}
      <div
        className={`absolute left-4 top-4 z-10 transition-all duration-500 ${
          fading ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-charcoal shadow-sm backdrop-blur-sm">
          {slide.tag}
        </span>
      </div>

      {/* Caption — bottom */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-12 text-white transition-all duration-500 ${
          fading ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <p className="font-display text-lg font-semibold leading-snug">
          {slide.caption}
        </p>
      </div>

      {/* Dot indicators — bottom right */}
      <div className="absolute bottom-5 right-5 z-10 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setFading(true);
              setTimeout(() => {
                setCurrent(i);
                setFading(false);
              }, 300);
            }}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
