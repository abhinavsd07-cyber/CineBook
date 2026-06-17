import React, { useState, useEffect, useRef } from "react";

export default function AdCarousel({ slides, height, className = "", autoPlayInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timerRef.current);
  }, [nextSlide, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-xl shadow-md bg-bms-surface group ${className}`} 
      style={height ? { height } : { aspectRatio: "1440 / 300" }}
    >
      <div 
        className="flex w-full h-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div 
            key={i} 
            className="min-w-full h-full flex items-center justify-center select-none" 
            onClick={() => s.link && window.open(s.link, "_blank")}
            style={{ cursor: s.link ? "pointer" : "default" }}
          >
             <img src={s.bg} alt={`Ad ${i}`} className="w-full h-full object-cover object-center" />
          </div>
        ))}
      </div>
      
      {slides.length > 1 && (
        <>
          <div>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 border-none cursor-pointer focus:outline-none z-10 opacity-0 group-hover:opacity-100" onClick={prevSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 border-none cursor-pointer focus:outline-none z-10 opacity-0 group-hover:opacity-100" onClick={nextSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 border-none cursor-pointer focus:outline-none ${i === currentIndex ? "bg-bms-accent w-4" : "bg-white/50 hover:bg-white/85"}`} 
                onClick={() => setCurrentIndex(i)} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
