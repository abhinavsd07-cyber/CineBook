import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieById, getMovieReviews, createReview, voteReview, getMovieRecommendations } from "../config/allApis";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import ScrollContainer from "../components/ScrollContainer";

const getYoutubeVideoId = (url) => {
  if (!url) return "";
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0];
  if (url.includes("watch?v=")) return url.split("watch?v=")[1]?.split("&")[0];
  if (url.includes("embed/")) return url.split("embed/")[1]?.split("?")[0];
  return url.split("/").pop();
};

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 10, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Trailer Modal State
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const fetchMovieData = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      getMovieById(id),
      getMovieReviews(id).catch(() => ({ data: { data: [] } })),
      getMovieRecommendations(id).catch(() => ({ data: { data: [] } }))
    ])
      .then(([movieRes, reviewsRes, recRes]) => {
        setMovie(movieRes.data.data);
        setReviews(reviewsRes.data.data);
        setRecommendations(recRes.data.data);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to post a review.");
    setSubmittingReview(true);
    try {
      await createReview({ movie: id, rating: reviewForm.rating, comment: reviewForm.comment });
      setReviewForm({ rating: 10, comment: "" });
      fetchMovieData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Error posting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (reviewId, type) => {
    if (!user) return alert("Please log in to vote.");
    try {
      await voteReview(reviewId, { type });
      fetchMovieData(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Check out ${movie.title} on Book My Show!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
    </div>
  );
  if (!movie) return null;

  const hasReviewed = reviews.some(r => r.user?._id === user?._id);

  const videoId = getYoutubeVideoId(movie.trailer);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : movie.trailer;

  return (
    <div className="pt-[110px] md:pt-[125px] pb-16 min-h-[calc(100vh-300px)] bg-[#f2f5f9] text-[#333333] transition-colors duration-300">
      <SEO 
        title={movie.title}
        description={movie.description?.substring(0, 160) || "Book tickets now on Book My Show"}
        image={movie.poster}
        url={`/movie/${movie._id}`}
      />
      {/* ── BMS Style Top Banner ── */}
      <div 
        className="relative min-h-[480px] w-full flex items-center bg-cover bg-center overflow-hidden py-10 bg-slate-900" 
        style={!movie.trailer ? { backgroundImage: `url(${movie.backdrop || movie.poster})` } : {}}
      >
        {movie.trailer && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden scale-110">
            <iframe
              className="w-full h-full object-cover opacity-35"
              src={`${embedUrl}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${videoId}`}
              title="Movie Trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        <div className="max-w-[1200px] mx-auto px-4 w-full relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center text-white">
          <div className="relative w-[180px] sm:w-[240px] md:w-[260px] aspect-[2/3] rounded-[10px] overflow-hidden shadow-2xl flex-shrink-0">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            {movie.isNowShowing && (
              <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur px-4 py-1.5 text-[11px] font-semibold uppercase text-center tracking-widest text-white">In cinemas</div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-5 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-white leading-tight">{movie.title}</h1>
            
            <div className="flex items-center gap-3 bg-[#333333] p-3 rounded-[8px] w-fit flex-wrap justify-center shadow-lg">
              <span className="text-[#F84464] text-xl">★</span>
              <span className="text-[18px] md:text-[22px] font-bold text-white">{movie.rating?.toFixed(1) || 0}/10</span>
              <span className="text-[13px] text-slate-300 font-medium ml-2">{reviews.length} Ratings &rsaquo;</span>
              <button className="bg-white text-[#333333] hover:bg-slate-100 font-semibold px-4 py-2 text-[12px] rounded-[6px] transition-colors ml-4 shadow-sm" onClick={() => document.getElementById("review-section").scrollIntoView({ behavior: "smooth" })}>Rate now</button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1">
              <span className="bg-white/90 text-[#333333] hover:bg-white px-3 py-1.5 text-[12px] font-semibold rounded-[4px] cursor-pointer">2D, 3D, IMAX</span>
              {Array.isArray(movie.language) ? (
                 movie.language.map((lang, idx) => <span key={idx} className="bg-white/90 text-[#333333] hover:bg-white px-3 py-1.5 text-[12px] font-semibold rounded-[4px] cursor-pointer">{lang}</span>)
              ) : (
                <span className="bg-white/90 text-[#333333] hover:bg-white px-3 py-1.5 text-[12px] font-semibold rounded-[4px] cursor-pointer">{movie.language}</span>
              )}
            </div>

            <div className="text-[14px] md:text-[15px] text-slate-200 font-medium tracking-wide">
              {movie.duration} • {movie.genre?.join(", ")} • UA • {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "TBA"}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap w-full md:w-auto gap-4 mt-4 items-center justify-center md:justify-start">
              {movie.itemType === "premiere" ? (
                <>
                  <button
                    className="w-full sm:w-auto bg-[#F84464] hover:bg-[#e03a58] text-white px-10 py-3.5 text-[15px] font-semibold rounded-[8px] shadow-lg transition-all duration-200"
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: movie.basePrice || 149 } })}
                  >
                    Rent for Rs. {movie.basePrice || 149}
                  </button>
                  <button
                    className="w-full sm:w-auto bg-transparent border border-white/40 hover:bg-white/10 text-white px-10 py-3.5 text-[15px] font-semibold rounded-[8px] transition-colors"
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: (movie.basePrice || 149) + 400 } })}
                  >
                    Buy for Rs. {(movie.basePrice || 149) + 400}
                  </button>
                </>
              ) : movie.isNowShowing ? (
                <button
                  className="w-full sm:w-auto bg-[#F84464] hover:bg-[#e03a58] text-white px-12 py-3.5 text-[16px] font-semibold rounded-[8px] shadow-lg transition-all"
                  onClick={() => navigate(`/select-theatre/${movie._id}`)}
                >
                  Book tickets
                </button>
              ) : null}

              {movie.trailer && (
                <button
                  className="w-full sm:w-auto bg-transparent border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 text-[15px] font-semibold rounded-[8px] transition-colors"
                  onClick={() => setShowTrailerModal(true)}
                >
                  Watch Trailer
                </button>
              )}

              <button
                className="w-full sm:w-auto bg-transparent text-white px-4 py-3.5 text-[15px] font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                onClick={handleShare}
                title="Share"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Content Section ── */}
      <div className="max-w-[1000px] mx-auto px-4 py-8 md:py-12 flex flex-col gap-10">
        <section className="w-full">
          <h3 className="text-[20px] md:text-[24px] font-bold text-[#333333] mb-4">About the movie</h3>
          <p className="text-[14px] md:text-[16px] leading-[1.6] text-[#333333]">{movie.description}</p>
        </section>

        <div className="h-[1px] bg-slate-200" />

        {movie.cast?.length > 0 && (
          <section className="w-full">
            <h3 className="text-[20px] md:text-[24px] font-bold text-[#333333] mb-6">Cast</h3>
            <div className="flex gap-6 overflow-x-auto py-2 scrollbar-none">
              {movie.cast.map((c, idx) => (
                <div key={idx} className="w-24 md:w-[110px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-500 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                    {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <span>{c.name.charAt(0)}</span>}
                  </div>
                  <span className="text-[14px] font-medium text-[#333333] w-full block leading-tight">{c.name}</span>
                  <span className="text-[12px] text-slate-500 mt-1 w-full block">Actor</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(movie.crew?.length > 0 || movie.director) && (
          <>
            <div className="h-[1px] bg-slate-200" />
            <section className="w-full">
              <h3 className="text-[20px] md:text-[24px] font-bold text-[#333333] mb-6">Crew</h3>
              <div className="flex gap-6 overflow-x-auto py-2 scrollbar-none">
                {movie.director && !movie.crew?.some(c => c.name === movie.director) && (
                  <div className="w-24 md:w-[110px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-500 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                      <span>{movie.director.charAt(0)}</span>
                    </div>
                    <span className="text-[14px] font-medium text-[#333333] w-full block leading-tight">{movie.director}</span>
                    <span className="text-[12px] md:text-[14px] text-slate-500 mt-0.5 w-full block truncate tracking-normal">Director</span>
                  </div>
                )}
                {movie.crew?.map((c, idx) => (
                  <div key={idx} className="w-24 md:w-[110px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-500 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                      {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <span>{c.name.charAt(0)}</span>}
                    </div>
                    <span className="text-[14px] font-medium text-[#333333] w-full block leading-tight">{c.name}</span>
                    <span className="text-[12px] text-slate-500 mt-1 w-full block">{c.role}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="h-[1px] bg-slate-200" />
        
        {/* REVIEWS SECTION */}
        <section className="w-full" id="review-section">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] md:text-[24px] font-bold text-[#333333]">Top reviews</h3>
            <span className="text-[13px] md:text-[14px] text-slate-500 font-medium">{reviews.length} reviews &rsaquo;</span>
          </div>

          {/* Review Form */}
          {user ? (
            !hasReviewed ? (
              <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-200 p-6 rounded-xl mb-8 max-w-[700px] shadow-sm">
                <h4 className="text-[15px] font-bold text-[#333333] mb-4">Write a Review</h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-[120px] flex-shrink-0">
                    <label className="block text-[12px] font-semibold text-slate-500 mb-2">Rating (1-10)</label>
                    <input 
                      type="number" 
                      min="1" max="10" 
                      className="w-full px-3 py-2 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text outline-none focus:border-bms-accent" 
                      value={reviewForm.rating} 
                      onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-bms-text-muted mb-2">Your thoughts</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text outline-none focus:border-bms-accent" 
                      placeholder="What did you think of the movie?" 
                      value={reviewForm.comment} 
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white px-5 py-2 text-xs font-bold rounded shadow-md transition-all duration-200 cursor-pointer" disabled={submittingReview}>Post Review</button>
                </div>
              </form>
            ) : (
              <div className="bg-bms-surface border border-bms-border py-4 px-6 rounded-xl text-center text-sm text-bms-text-muted mb-8 max-w-[700px]">
                You have already reviewed this movie.
              </div>
            )
          ) : (
             <div className="bg-bms-surface border border-bms-border py-4 px-6 rounded-xl text-center text-sm text-bms-text-muted mb-8 max-w-[700px]">
                Please log in to write a review.
             </div>
          )}

          {/* Review List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r._id} className="bg-bms-surface border border-bms-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-full bg-bms-accent text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-bms-border">
                        {r.user?.avatar ? (
                          <img src={r.user.avatar} alt={r.user.name} className="w-full h-full object-cover" />
                        ) : (
                          r.user?.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-bms-text">{r.user?.name || "Anonymous"}</div>
                        <div className="text-[10px] text-bms-text-dim">Booked on Book My Show</div>
                      </div>
                    </div>
                    <div className="text-bms-accent font-bold text-sm bg-bms-accent-glow px-2.5 py-1 rounded-full border border-bms-accent/10">
                      ⭐ {r.rating}/10
                    </div>
                  </div>
                  <p className="text-sm text-bms-text-muted leading-relaxed mb-4">
                    {r.comment}
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs text-bms-text-dim border-t border-bms-border/50 pt-3 mt-auto">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleVote(r._id, "like")} 
                      className={`bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-bms-accent transition-colors duration-150 ${r.likedBy?.includes(user?._id) ? "text-bms-accent" : ""}`}
                    >
                      👍 {r.likes}
                    </button>
                    <button 
                      onClick={() => handleVote(r._id, "dislike")}
                      className={`bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-bms-accent transition-colors duration-150 ${r.dislikedBy?.includes(user?._id) ? "text-bms-accent" : ""}`}
                    >
                      👎 {r.dislikes}
                    </button>
                  </div>
                  <div>
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full text-center py-12 text-bms-text-muted bg-bms-surface/50 border border-dashed border-bms-border rounded-xl">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </section>

        {/* ── You Might Also Like Section ── */}
        {recommendations.length > 0 && (
          <>
            <div className="h-[1px] bg-bms-border/50" />
            <section className="w-full">
              <h3 className="text-xl md:text-2xl font-bold text-bms-text mb-4">You Might Also Like</h3>
              <ScrollContainer className="py-3">
                {recommendations.map(rec => (
                  <Link 
                    to={`/movie/${rec._id}`} 
                    key={rec._id} 
                    className="w-40 flex-shrink-0 group"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm hover:shadow-md bg-bms-surface border border-bms-border transition-all duration-300">
                      <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h4 className="text-sm font-bold text-bms-text mt-3 truncate group-hover:text-bms-accent transition-colors duration-150">{rec.title}</h4>
                    <p className="text-xs text-bms-text-muted mt-0.5 truncate">{rec.genre?.join(", ")}</p>
                  </Link>
                ))}
              </ScrollContainer>
            </section>
          </>
        )}
      </div>

      {/* ── Trailer Modal ── */}
      {showTrailerModal && movie.trailer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur z-[3000] flex justify-center items-center p-4 md:p-8 animate-fade-in" onClick={() => setShowTrailerModal(false)}>
          <div className="relative w-full max-w-[960px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-white text-3xl font-light hover:text-bms-accent transition-colors duration-150 z-20 cursor-pointer border-none bg-transparent" onClick={() => setShowTrailerModal(false)}>✕</button>
            <div className="w-full h-full">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
