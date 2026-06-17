import React, { useRef, useState, useEffect } from "react";

export default function ScrollContainer({ children, className = "", style = {} }) {
  const scrollRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 10);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      
      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener("scroll", checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full group/scroll" style={style}>
      {showLeftBtn && (
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 shadow-md text-white flex items-center justify-center cursor-pointer transition-all duration-200 z-10 focus:outline-none" 
          onClick={() => scroll("left")} 
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}
      
      <div className={`overflow-x-auto flex gap-6 py-2 scrollbar-none scroll-smooth ${className}`} ref={scrollRef}>
        {children}
      </div>

      {showRightBtn && (
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 shadow-md text-white flex items-center justify-center cursor-pointer transition-all duration-200 z-10 focus:outline-none" 
          onClick={() => scroll("right")} 
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}
