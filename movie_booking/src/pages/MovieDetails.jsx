import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieById, getMovieReviews, createReview, voteReview, getMovieRecommendations } from "../config/allApis";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import ScrollContainer from "../components/ScrollContainer";
import "./MovieDetails.css";

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
      fetchMovieData(); // refresh movie (for new average rating) and reviews
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
      fetchMovieData(); // refresh reviews to get updated likes
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

  if (loading) return <div className="page-loader" style={{ paddingTop: "80px" }}><div className="spinner" /></div>;
  if (!movie) return null;

  const hasReviewed = reviews.some(r => r.user?._id === user?._id);

  const videoId = getYoutubeVideoId(movie.trailer);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : movie.trailer;

  return (
    <div className="movie-details-page page-wrapper">
      <SEO 
        title={movie.title}
        description={movie.description?.substring(0, 160) || "Book tickets now on Book My Show"}
        image={movie.poster}
        url={`/movie/${movie._id}`}
      />
      {/* ── BMS Style Top Banner ── */}
      <div 
        className="md-banner-container" 
        style={!movie.trailer ? { backgroundImage: `url(${movie.backdrop || movie.poster})` } : {}}
      >
        {movie.trailer && (
          <div className="md-video-wrapper">
            <iframe
              className="md-banner-video"
              src={`${embedUrl}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${videoId}`}
              title="Movie Trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div className="md-banner-overlay" />
        <div className="container md-banner-content">
          <div className="md-poster-wrapper">
            <img src={movie.poster} alt={movie.title} className="md-poster" />
            {movie.isNowShowing && (
              <div className="md-in-cinemas">In cinemas</div>
            )}
          </div>
          
          <div className="md-info-wrapper">
            <h1 className="md-title">{movie.title}</h1>
            
            <div className="md-rating-box">
              <span className="md-star">⭐</span>
              <span className="md-rating-score">{movie.rating?.toFixed(1) || 0}/10</span>
              <span className="md-rating-votes">{reviews.length} Reviews &rsaquo;</span>
              <button className="btn md-rate-now-btn" onClick={() => document.getElementById("review-section").scrollIntoView({ behavior: "smooth" })}>Rate now</button>
            </div>

            <div className="md-tags">
              <span className="md-tag md-tag-white">2D, 3D, IMAX</span>
              {Array.isArray(movie.language) ? (
                 movie.language.map((lang, idx) => <span key={idx} className="md-tag md-tag-white">{lang}</span>)
              ) : (
                <span className="md-tag md-tag-white">{movie.language}</span>
              )}
            </div>

            <div className="md-meta">
              {movie.duration} • {movie.genre?.join(", ")} • {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "TBA"}
            </div>

            <div className="md-action-buttons" style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
              {movie.itemType === "premiere" ? (
                <>
                  <button
                    className="btn btn-primary btn-lg md-book-btn"
                    style={{ background: "#F84464" }}
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: movie.basePrice || 149 } })}
                  >
                    Rent for Rs. {movie.basePrice || 149}
                  </button>
                  <button
                    className="btn btn-outline btn-lg md-book-btn"
                    style={{ borderColor: "white", color: "white" }}
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: (movie.basePrice || 149) + 400 } })}
                  >
                    Buy for Rs. {(movie.basePrice || 149) + 400}
                  </button>
                </>
              ) : movie.isNowShowing ? (
                <button
                  className="btn btn-primary btn-lg md-book-btn"
                  onClick={() => navigate(`/select-theatre/${movie._id}`)}
                >
                  Book tickets
                </button>
              ) : null}

              {movie.trailer && (
                <button
                  className="btn btn-outline btn-lg md-book-btn"
                  style={{ borderColor: "white", color: "white" }}
                  onClick={() => setShowTrailerModal(true)}
                >
                  Watch Trailer ▷
                </button>
              )}

              <button
                className="btn btn-outline btn-lg md-book-btn"
                style={{ borderColor: "white", color: "white", display: "inline-flex", alignItems: "center" }}
                onClick={handleShare}
                title="Share"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 8}}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Content Section ── */}
      <div className="container md-bottom-content">
        <section className="md-section">
          <h3>About the movie</h3>
          <p className="md-description">{movie.description}</p>
        </section>

        <div className="md-divider" />

        {movie.cast?.length > 0 && (
          <section className="md-section">
            <h3>Cast</h3>
            <div className="md-cast-grid">
              {movie.cast.map((c, idx) => (
                <div key={idx} className="md-cast-card">
                  <div className="md-cast-img">
                    {c.image ? <img src={c.image} alt={c.name} /> : <span>{c.name.charAt(0)}</span>}
                  </div>
                  <span className="md-cast-name">{c.name}</span>
                  <span className="md-cast-role">{c.role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(movie.crew?.length > 0 || movie.director) && (
          <>
            <div className="md-divider" />
            <section className="md-section">
              <h3>Crew</h3>
              <div className="md-cast-grid">
                {movie.director && !movie.crew?.some(c => c.name === movie.director) && (
                  <div className="md-cast-card">
                    <div className="md-cast-img"><span>{movie.director.charAt(0)}</span></div>
                    <span className="md-cast-name">{movie.director}</span>
                    <span className="md-cast-role">Director</span>
                  </div>
                )}
                {movie.crew?.map((c, idx) => (
                  <div key={idx} className="md-cast-card">
                    <div className="md-cast-img">
                      {c.image ? <img src={c.image} alt={c.name} /> : <span>{c.name.charAt(0)}</span>}
                    </div>
                    <span className="md-cast-name">{c.name}</span>
                    <span className="md-cast-role">{c.role}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="md-divider" />
        
        {/* REVIEWS SECTION */}
        <section className="md-section" id="review-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3>Top reviews</h3>
            <span style={{ color: "var(--clr-text-muted)" }}>{reviews.length} reviews &rsaquo;</span>
          </div>

          {/* Review Form */}
          {user ? (
            !hasReviewed ? (
              <form onSubmit={handleReviewSubmit} style={{ background: "var(--clr-bg-alt)", padding: 20, borderRadius: 12, marginBottom: 30 }}>
                <h4 style={{ marginBottom: 15, fontSize: "1rem" }}>Write a Review</h4>
                <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: 5, fontSize: "0.875rem" }}>Rating (1-10)</label>
                    <input 
                      type="number" 
                      min="1" max="10" 
                      className="form-input" 
                      value={reviewForm.rating} 
                      onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })} 
                      required 
                    />
                  </div>
                  <div style={{ flex: 4 }}>
                    <label style={{ display: "block", marginBottom: 5, fontSize: "0.875rem" }}>Your thoughts</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="What did you think of the movie?" 
                      value={reviewForm.comment} 
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                      required 
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>Post Review</button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ background: "var(--clr-bg-alt)", padding: 15, borderRadius: 12, marginBottom: 30, textAlign: "center", color: "var(--clr-text-muted)" }}>
                You have already reviewed this movie.
              </div>
            )
          ) : (
             <div style={{ background: "var(--clr-bg-alt)", padding: 15, borderRadius: 12, marginBottom: 30, textAlign: "center" }}>
                <p style={{ margin: 0, color: "var(--clr-text-muted)" }}>Please log in to write a review.</p>
             </div>
          )}

          {/* Review List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {reviews.map((r) => (
              <div key={r._id} style={{ border: "1px solid var(--clr-border)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--clr-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", overflow: "hidden" }}>
                      {r.user?.avatar ? (
                        <img src={r.user.avatar} alt={r.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        r.user?.name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.user?.name || "Anonymous"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>Booked on Book My Show</div>
                    </div>
                  </div>
                  <div style={{ color: "var(--clr-error)", fontWeight: "bold", fontSize: "0.9rem" }}>
                    ⭐ {r.rating}/10
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--clr-text)", lineHeight: 1.5, marginBottom: 20 }}>
                  {r.comment}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", gap: 15 }}>
                    <button 
                      onClick={() => handleVote(r._id, "like")} 
                      style={{ background: "none", border: "none", color: r.likedBy?.includes(user?._id) ? "var(--clr-primary)" : "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      👍 {r.likes}
                    </button>
                    <button 
                      onClick={() => handleVote(r._id, "dislike")}
                      style={{ background: "none", border: "none", color: r.dislikedBy?.includes(user?._id) ? "var(--clr-primary)" : "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      👎 {r.dislikes}
                    </button>
                  </div>
                  <div>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--clr-text-muted)" }}>
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </section>

        {/* ── You Might Also Like Section ── */}
        {recommendations.length > 0 && (
          <>
            <div className="md-divider" />
            <section className="md-section">
              <h3>You Might Also Like</h3>
              <ScrollContainer 
                className="h-scroll" 
                style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "15px", scrollbarWidth: "thin" }}
              >
                {recommendations.map(rec => (
                  <Link 
                    to={`/movie/${rec._id}`} 
                    key={rec._id} 
                    style={{ flex: "0 0 160px", textDecoration: "none", color: "inherit" }}
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px", aspectRatio: "2/3" }}>
                      <img src={rec.poster} alt={rec.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                    </div>
                    <h4 style={{ margin: "10px 0 5px 0", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rec.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>{rec.genre?.join(", ")}</p>
                  </Link>
                ))}
              </ScrollContainer>
            </section>
          </>
        )}

      </div>

      {/* ── Trailer Modal ── */}
      {showTrailerModal && movie.trailer && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailerModal(false)}>×</button>
            <div className="trailer-iframe-wrapper">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
