import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMovies } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import { FaMagnifyingGlass, FaFilter, FaFilm, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa6";
import SEO from "../components/SEO";
import "./Explore.css";

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
    <div className="explore-page page-wrapper">
      <SEO 
        title={searchQuery ? `Search results for "${searchQuery}"` : "Explore Movies & Events"}
        description="Browse our vast collection of movies, events, and exclusive premieres."
        url="/explore"
      />
      <div className="explore-header">
        <div className="container">
          <div className="explore-search-bar">
            <FaMagnifyingGlass size={24} className="search-icon" />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={`mic-btn ${isListening ? 'listening-pulse' : ''}`} onClick={toggleListen} title="Voice Search">
              {isListening ? <FaMicrophoneSlash size={24} color="#E50914" /> : <FaMicrophone size={24} color="var(--clr-text-muted)" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container explore-container">
        {/* SIDEBAR FILTERS */}
        <aside className="explore-sidebar glass">
          <div className="sidebar-header">
            <h3><FaFilter style={{ verticalAlign: "middle" }}/> Filters</h3>
            {(itemType || selectedGenre || selectedLanguage) && (
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => { setItemType(""); setSelectedGenre(""); setSelectedLanguage(""); }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="filter-group">
            <h4>Type</h4>
            <div className="filter-options">
              <label className="radio-label">
                <input type="radio" name="type" checked={itemType === ""} onChange={() => setItemType("")} /> All
              </label>
              <label className="radio-label">
                <input type="radio" name="type" checked={itemType === "movie"} onChange={() => setItemType("movie")} /> Movies
              </label>
              <label className="radio-label">
                <input type="radio" name="type" checked={itemType === "event"} onChange={() => setItemType("event")} /> Events
              </label>
              <label className="radio-label">
                <input type="radio" name="type" checked={itemType === "premiere"} onChange={() => setItemType("premiere")} /> Premieres
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4>Language</h4>
            <div className="filter-chips">
              {LANGUAGES.map(lang => (
                <button 
                  key={lang} 
                  className={`chip ${selectedLanguage === lang ? "active" : ""}`}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? "" : lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Genre</h4>
            <div className="filter-chips">
              {GENRES.map(genre => (
                <button 
                  key={genre} 
                  className={`chip ${selectedGenre === genre ? "active" : ""}`}
                  onClick={() => setSelectedGenre(selectedGenre === genre ? "" : genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main className="explore-results">
          {loading ? (
            <div className="explore-loader"><div className="spinner" /></div>
          ) : movies.length > 0 ? (
            <div className="explore-grid">
              {movies.map((m) => (
                <div key={m._id} className="movie-card animate-slide-up" onClick={() => handleCardClick(m)}>
                  <div className="card-img-wrapper">
                    <img src={m.poster} alt={m.title} className="card-img" />
                    {m.itemType === "premiere" && <div className="card-badge badge-accent" style={{ position: "absolute", top: 10, left: 10 }}>Premiere</div>}
                    {m.itemType === "event" && <div className="card-badge badge-platinum" style={{ position: "absolute", top: 10, left: 10 }}>Event</div>}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{m.title}</h3>
                    <p className="card-meta">
                      {Array.isArray(m.language) ? m.language.join(", ") : (m.language || "English")} • {m.genre?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="explore-empty">
              <FaFilm size={64} style={{ color: "var(--clr-text-muted)", marginBottom: 16 }} />
              <h2>No Results Found</h2>
              <p style={{ color: "var(--clr-text-muted)" }}>Try adjusting your filters or search query.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
