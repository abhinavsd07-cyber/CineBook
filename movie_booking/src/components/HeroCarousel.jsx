import React, { useState, useEffect } from "react";

const slides = [
  {
    title: "Introducing an event management tool",
    description: "Experience the ease of event creation and publishing",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    bg: "bg-[#2E3354]",
  },
  {
    title: "Conduct workshops and much more",
    description: "Share your skills with people around the world - from home!",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200",
    bg: "bg-[#607D8B]",
  },
  {
    title: "Take advantage of our M-ticket feature",
    description: "Lets your audience skip the box office queue and head straight to the gate.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
    bg: "bg-[#A97753]",
  },
  {
    title: "Empower the artist within you",
    description: "List your own performances, gigs and more with cineBook",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
    bg: "bg-[#355D32]",
  },
  {
    title: "Ticket scanning made easy",
    description: "Experience the ease of managing entry at an event.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200",
    bg: "bg-[#566273]",
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActive((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const prevIndex = active === 0 ? slides.length - 1 : active - 1;
  const nextIndex = active === slides.length - 1 ? 0 : active + 1;

  const BannerCard = ({ slide, activeCard }) => {
    return (
      <div
        className={`
          rounded-xl overflow-hidden shadow-lg shrink-0
          transition-all duration-500 ease-in-out flex flex-col-reverse md:flex-row
          ${slide.bg}
          ${activeCard ? "w-full max-w-[850px] h-auto md:h-[260px] opacity-100" : "hidden md:flex w-[280px] h-[260px] opacity-60"}
        `}
      >
        {/* Left Side: Content Box */}
        <div className="w-full md:w-[52%] md:min-w-[280px] px-6 md:px-8 py-6 flex flex-col justify-center text-white transition-all duration-500">
          <h2
            className={`font-bold leading-tight transition-all duration-500 line-clamp-2 ${
              activeCard ? "text-[32px]" : "text-[20px]"
            }`}
          >
            {slide.title}
          </h2>

          <p
            className={`mt-3 line-clamp-2 transition-all duration-500 text-gray-200 ${
              activeCard ? "text-[16px]" : "text-[14px]"
            }`}
          >
            {slide.description}
          </p>

          {activeCard && (
            <div className="mt-4 flex items-center gap-5 animate-fadeIn">
              <a href="#" className="text-[15px] underline hover:text-gray-300 transition-colors">
                Know More
              </a>
              <button className="bg-white text-[#e8293c] px-5 py-2 rounded-md font-medium text-[14px] hover:bg-gray-100 transition-colors">
                Contact us today
              </button>
            </div>
          )}
        </div>

          {/* Right Side: Image Box (Always rendered, animated via opacity & scale) */}
          <div 
            className={`w-full md:w-[48%] h-[160px] md:h-full overflow-hidden transition-all duration-500 origin-right ${
              activeCard ? "opacity-100 scale-100" : "opacity-0 scale-95 md:w-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
      </div>
    );
  };

  return (
    <section className="bg-[#f1f2f4] py-6 md:py-10 overflow-hidden w-full select-none">
      <div className="max-w-[1450px] mx-auto relative flex items-center justify-center gap-6 px-4 md:px-12">
        
        {/* Left Preview Slide */}
        <BannerCard slide={slides[prevIndex]} activeCard={false} />

        {/* Active Main Slide */}
        <BannerCard slide={slides[active]} activeCard={true} />

        {/* Right Preview Slide */}
        <BannerCard slide={slides[nextIndex]} activeCard={false} />

        {/* Navigation Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 w-10 md:w-12 h-10 md:h-12 bg-black/30 text-white rounded-xl flex items-center justify-center text-2xl md:text-3xl hover:bg-black/60 transition-colors z-10"
        >
          ‹
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 w-10 md:w-12 h-10 md:h-12 bg-black/30 text-white rounded-xl flex items-center justify-center text-2xl md:text-3xl hover:bg-black/60 transition-colors z-10"
        >
          ›
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              active === index ? "w-8 bg-[#1f253a]" : "w-3 bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}