import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMovies } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import { LuSearch, LuFilter, LuFilm, LuMic, LuMicOff } from "react-icons/lu";
import SEO from "../components/SEO";

const GENRES = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Thriller"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Malayalam"];

export default function Explore() {
  const navigate = useNavigate();
  const { location } = useLocationContext();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemType, setItemType] = useState(""); // empty means all
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [isListening, setIsListening] = useState(false);

  // Initialize SpeechRecognition
  let recognition = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      if (recognition) {
        recognition.start();
      } else {
        alert("Your browser does not support Voice Search. Please try Google Chrome.");
      }
    }
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchMovies = React.useCallback(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (itemType) params.itemType = itemType;
    if (selectedGenre) params.genre = selectedGenre;
    if (selectedLanguage) params.language = selectedLanguage;
    if (location) params.location = location;

    getAllMovies(params)
      .then((res) => setMovies(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [debouncedSearch, itemType, selectedGenre, selectedLanguage, location]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchMovies();
  }, [fetchMovies]);

  const handleCardClick = (m) => {
    if (m.itemType === "premiere") {
      navigate(`/movie/${m._id}`);
    } else if (m.itemType === "event") {
      navigate(`/events/${m._id}`);
    } else {
      navigate(`/movie/${m._id}`);
    }
  };

  return (
    <div className="pt-[110px] md:pt-[125px] pb-16 min-h-[calc(100vh-300px)] bg-[#f2f5f9] text-[#333333]">
      <SEO 
        title={searchQuery ? `Search results for "${searchQuery}"` : "Explore Movies & Events"}
        description="Browse our vast collection of movies, events, and exclusive premieres."
        url="/explore"
      />
      <div className="bg-white border-b border-slate-200 py-4 mb-8 shadow-sm px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 bg-white border border-slate-300 hover:border-slate-400 focus-within:border-[#F84464] rounded-[8px] px-4 h-12 w-full max-w-[800px] transition-all duration-200 shadow-inner shadow-slate-50/50">
            <LuSearch size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#333333] placeholder-slate-400 w-full"
            />
            <button 
              className={`p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all duration-200 cursor-pointer ${
                isListening ? 'animate-pulse bg-red-50 text-[#F84464]' : ''
              }`} 
              onClick={toggleListen} 
              title="Voice Search"
            >
              {isListening ? <LuMicOff size={18} className="text-[#F84464]" /> : <LuMic size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="w-full md:w-[280px] flex-shrink-0 self-start md:sticky md:top-[130px]">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[24px] font-bold text-[#333333]">Filters</h3>
            {(itemType || selectedGenre || selectedLanguage) && (
              <button 
                className="text-[13px] font-normal text-[#F84464] hover:underline cursor-pointer border-none bg-transparent" 
                onClick={() => { setItemType(""); setSelectedGenre(""); setSelectedLanguage(""); }}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden mb-4">
            <div className="p-4 border-b border-slate-200 last:border-b-0 bg-[#f8f9fa]">
              <h4 className="text-[14px] font-bold text-[#333333] mb-3">Type</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-[13px] font-normal text-[#333333] cursor-pointer hover:text-[#F84464] transition-colors">
                  <input type="radio" name="type" checked={itemType === ""} onChange={() => setItemType("")} className="w-4 h-4 accent-[#F84464] cursor-pointer" /> All
                </label>
                <label className="flex items-center gap-3 text-[13px] font-normal text-[#333333] cursor-pointer hover:text-[#F84464] transition-colors">
                  <input type="radio" name="type" checked={itemType === "movie"} onChange={() => setItemType("movie")} className="w-4 h-4 accent-[#F84464] cursor-pointer" /> Movies
                </label>
                <label className="flex items-center gap-3 text-[13px] font-normal text-[#333333] cursor-pointer hover:text-[#F84464] transition-colors">
                  <input type="radio" name="type" checked={itemType === "event"} onChange={() => setItemType("event")} className="w-4 h-4 accent-[#F84464] cursor-pointer" /> Events
                </label>
                <label className="flex items-center gap-3 text-[13px] font-normal text-[#333333] cursor-pointer hover:text-[#F84464] transition-colors">
                  <input type="radio" name="type" checked={itemType === "premiere"} onChange={() => setItemType("premiere")} className="w-4 h-4 accent-[#F84464] cursor-pointer" /> Premieres
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden mb-4">
            <div className="p-4 border-b border-slate-200 last:border-b-0">
              <h4 className="text-[14px] font-bold text-[#F84464] mb-3">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button 
                    key={lang} 
                    className={`px-4 py-2 rounded-[4px] text-[13px] font-normal border transition-all cursor-pointer ${
                      selectedLanguage === lang 
                        ? "bg-[#F84464] text-white border-[#F84464]" 
                        : "bg-white hover:border-[#F84464] border-slate-200 text-[#333333]"
                    }`}
                    onClick={() => setSelectedLanguage(selectedLanguage === lang ? "" : lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 last:border-b-0">
              <h4 className="text-[14px] font-bold text-[#F84464] mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button 
                    key={genre} 
                    className={`px-4 py-2 rounded-[4px] text-[13px] font-normal border transition-all cursor-pointer ${
                      selectedGenre === genre 
                        ? "bg-[#F84464] text-white border-[#F84464]" 
                        : "bg-white hover:border-[#F84464] border-slate-200 text-[#333333]"
                    }`}
                    onClick={() => setSelectedGenre(selectedGenre === genre ? "" : genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main className="flex-1">
          <div className="mb-4">
            <h2 className="text-[24px] font-bold text-[#333333]">
              {itemType === "movie" ? "Movies" : itemType === "event" ? "Events" : itemType === "premiere" ? "Premieres" : "All Entertainment"} In {location || "Your City"}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-[#F84464] rounded-full animate-spin" />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((m) => (
                <div key={m._id} className="bg-transparent rounded-[8px] overflow-hidden cursor-pointer group" onClick={() => handleCardClick(m)}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-[8px] bg-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    
                    {/* Overlays */}
                    {m.itemType === "premiere" && <div className="absolute top-2 left-2 bg-[#F84464] text-white text-[10px] font-bold py-1 px-2 rounded-[4px] shadow-sm uppercase tracking-wide">Premiere</div>}
                    {m.itemType === "event" && <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white text-[10px] font-bold py-1 px-2 rounded-[4px] shadow-sm uppercase tracking-wide">Event</div>}
                    
                    {/* BookMyShow Rating Tag (Mocked) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#000000e6] text-white p-2 flex justify-between items-center z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-1.5 text-[13px] font-bold">
                        <span className="text-[#F84464]">♥</span> {Math.floor(Math.random() * 30 + 70)}%
                      </div>
                      <div className="text-[10px] font-medium text-[#cccccc] uppercase">
                        {(Math.random() * 50 + 10).toFixed(1)}k Votes
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 pb-4">
                    <h3 className="text-[16px] font-medium text-[#333333] truncate group-hover:text-[#F84464] transition-colors">{m.title}</h3>
                    <p className="text-[13px] text-[#666666] truncate mt-0.5 font-normal">
                      {Array.isArray(m.language) ? m.language.join(", ") : (m.language || "English")} • {m.genre?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-[8px]">
              <LuFilm size={48} className="text-slate-300 mb-4" />
              <h2 className="text-[18px] font-bold text-[#333333] mb-1">No Results Found</h2>
              <p className="text-[14px] text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
