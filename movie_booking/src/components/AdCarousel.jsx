import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

/**
 * AdCarousel — cineBook-style infinite peek carousel.
 *
 * Uses a clone-based infinite loop so slides ALWAYS scroll forward (left).
 * Never reverses direction, even when wrapping last→first or first→last.
 *
 * Clone layout:  [clone of last] | slide0 | slide1 | … | slideN | [clone of first]
 *                    extIndex=0      idx=1   idx=2   …   idx=N    idx=N+1
 */
export default function AdCarousel({
  slides,
  height,
  className = "",
  autoPlayInterval = 4000,
}) {
  const containerRef = useRef(null);
  const timerRef     = useRef(null);
  const dragStartX   = useRef(null);

  const [dims, setDims] = useState({ slideWidth: 0, peek: 0 });

  const total = slides?.length ?? 0;

  /* ── Extended slides: [last_clone, ...originals, first_clone] ── */
  const extSlides = useMemo(() => {
    if (total === 0) return [];
    return [slides[total - 1], ...slides, slides[0]];
  }, [slides, total]);

  /* extIndex tracks position in extSlides. Start at 1 (= real slide 0). */
  const [extIndex, setExtIndex] = useState(1);

  /* When true, skip CSS transition (used for instant clone→real jump) */
  const [noTransition, setNoTransition] = useState(false);

  /* ── Measure container width ── */
  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const p = Math.min(110, Math.max(20, Math.round(containerW * 0.075)));
    setDims({ slideWidth: containerW - p * 2, peek: p });
  }, []);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* ── Navigation — always increment for forward scroll ── */
  const advance = useCallback(() => {
    setExtIndex((prev) => prev + 1);
  }, []);

  const retreat = useCallback(() => {
    setExtIndex((prev) => prev - 1);
  }, []);

  /* ── After reaching a clone boundary, jump instantly to real slide ── */
  const handleTransitionEnd = useCallback(() => {
    if (extIndex >= extSlides.length - 1) {
      /* Reached clone of first slide at the right end → jump to real first slide */
      setNoTransition(true);
      setExtIndex(1);
    } else if (extIndex <= 0) {
      /* Reached clone of last slide at the left end → jump to real last slide */
      setNoTransition(true);
      setExtIndex(total);
    }
  }, [extIndex, extSlides.length, total]);

  /* Re-enable transition after the instant jump renders */
  useEffect(() => {
    if (!noTransition) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setNoTransition(false))
    );
    return () => cancelAnimationFrame(id);
  }, [noTransition]);

  /* ── Auto-play ── */
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, autoPlayInterval);
  }, [advance, autoPlayInterval]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  /* ── Drag / swipe ── */
  const onDown = (x) => { dragStartX.current = x; };
  const onUp   = (x) => {
    if (dragStartX.current === null) return;
    const d = dragStartX.current - x;
    dragStartX.current = null;
    if (Math.abs(d) > 40) {
      d > 0 ? advance() : retreat();
      resetTimer();
    }
  };

  /* ── Derived current index for dots (maps extIndex → real slide index) ── */
  const currentIndex =
    extIndex <= 0          ? total - 1 :
    extIndex >= total + 1  ? 0 :
    extIndex - 1;

  /* ── Dot click: jump directly to real slide ── */
  const goToReal = (realIdx) => {
    setExtIndex(realIdx + 1);
    resetTimer();
  };

  if (!slides || total === 0) return null;

  const { slideWidth, peek } = dims;
  const GAP = 10; /* gap between slides, matches cineBook */

  /*
   * trackOffset = peek − extIndex × (slideWidth + GAP)
   *
   * extIndex=1 (slide 0): offset = peek          → slide 0 inset by peek
   * extIndex=2 (slide 1): offset = peek − (w+gap) → slide 0's right edge at peek
   */
  const trackOffset = slideWidth > 0
    ? peek - extIndex * (slideWidth + GAP)
    : peek;

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      style={height ? { height } : {}}
    >
      {/* ── Clip window ── */}
      <div
        className="w-full overflow-hidden"
        style={height ? { height } : { aspectRatio: "1440 / 310" }}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchEnd={(e)   => onUp(e.changedTouches[0].clientX)}
        onMouseDown={(e)  => onDown(e.clientX)}
        onMouseUp={(e)    => onUp(e.clientX)}
        onMouseLeave={(e) => { if (dragStartX.current !== null) onUp(e.clientX); }}
      >
        {/* ── Sliding track ── */}
        <div
          className="flex h-full"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform:  `translateX(${trackOffset}px)`,
            gap:        `${GAP}px`,
            transition: noTransition || slideWidth === 0
              ? "none"
              : "transform 0.48s cubic-bezier(0.25, 1, 0.5, 1)",
            willChange: "transform",
          }}
        >
          {extSlides.map((s, i) => {
            const isActive = i === extIndex;
            return (
              <div
                key={i}
                className="relative h-full flex-shrink-0"
                onClick={() => s.link && window.open(s.link, "_blank")}
                style={{
                  width:  slideWidth > 0 ? `${slideWidth}px` : `calc(100% - ${peek * 2}px)`,
                  cursor: s.link ? "pointer" : "default",
                }}
              >
                <img
                  src={s.bg}
                  alt={`Banner ${i}`}
                  className="w-full h-full object-cover object-center rounded-xl"
                  draggable={false}
                  loading="lazy"
                />
                {!isActive && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.10)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pagination dots ── */}
      {total > 1 && (
        <div className="flex justify-center gap-[5px] mt-[10px]">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goToReal(i)}
              style={{
                width:        i === currentIndex ? 18 : 6,
                height:       6,
                borderRadius: 9999,
                border:       "none",
                background:   i === currentIndex ? "#F84464" : "#bbb",
                cursor:       "pointer",
                padding:      0,
                transition:   "all 0.3s",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Nav arrows ── */}
      {total > 1 && (
        <>
          <button
            aria-label="Previous"
            className="bms-carousel-arrow"
            style={{ left: peek + 8 }}
            onClick={() => { retreat(); resetTimer(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            aria-label="Next"
            className="bms-carousel-arrow"
            style={{ right: peek + 8 }}
            onClick={() => { advance(); resetTimer(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
