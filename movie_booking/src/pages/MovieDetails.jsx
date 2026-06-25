import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovieById, getMovieReviews, createReview, voteReview, getMovieRecommendations, toggleMovieInterest } from "../config/allApis";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import ScrollContainer from "../components/ScrollContainer";
import { toast } from "react-toastify";
import { LuThumbsUp } from "react-icons/lu";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [reviewForm, setReviewForm] = useState({ rating: 10, comment: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movieDetails', id],
    queryFn: async () => {
      const [movieRes, reviewsRes, recRes] = await Promise.all([
        getMovieById(id),
        getMovieReviews(id).catch(() => ({ data: { data: [] } })),
        getMovieRecommendations(id).catch(() => ({ data: { data: [] } }))
      ]);
      return {
        movie: movieRes.data.data,
        reviews: reviewsRes.data.data,
        recommendations: recRes.data.data
      };
    },
    retry: 1
  });

  const { movie, reviews, recommendations } = data || {};

  const toggleInterestMutation = useMutation({
    mutationFn: () => toggleMovieInterest(movie._id),
    onSuccess: (res) => {
      if (res.data.success) {
        queryClient.invalidateQueries(['movieDetails', id]);
        toast.success(res.data.message);
      }
    },
    onError: () => toast.error("Failed to update interest")
  });

  const createReviewMutation = useMutation({
    mutationFn: (newReview) => createReview(newReview),
    onSuccess: () => {
      setReviewForm({ rating: 10, comment: "" });
      queryClient.invalidateQueries(['movieDetails', id]);
      toast.success("✅ Review posted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "❌ Error posting review");
    }
  });

  const voteReviewMutation = useMutation({
    mutationFn: ({ reviewId, type }) => voteReview(reviewId, { type }),
    onSuccess: () => {
      queryClient.invalidateQueries(['movieDetails', id]);
    }
  });

  const handleInterestClick = () => {
    if (!user) {
      toast.error("Please login to mark interest");
      navigate("/login");
      return;
    }
    toggleInterestMutation.mutate();
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("⚠️ Please log in to post a review.");
      return;
    }
    createReviewMutation.mutate({ movie: id, rating: reviewForm.rating, comment: reviewForm.comment });
  };

  const handleVote = (reviewId, type) => {
    if (!user) {
      toast.warning("⚠️ Please log in to vote.");
      return;
    }
    voteReviewMutation.mutate({ reviewId, type });
  };

  const formatCount = (count) => {
    if (!count) return "0";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K+";
    return count;
  };

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: `Check out ${movie.title} on cineBook!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("🔗 Link copied to clipboard!");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-48 bg-slate-50 dark:bg-[#0B0E14] min-h-[80vh]">
      <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-[#F84464] rounded-full animate-spin" />
    </div>
  );

  if (isError || !movie) {
    navigate("/");
    return null;
  }

  const hasReviewed = reviews?.some(r => r.user?._id === user?._id);

  return (
    <div className="pt-[100px] md:pt-[96px] pb-16 min-h-[calc(100vh-300px)] bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <SEO 
        title={movie.title}
        description={movie.description?.substring(0, 160) || "Book tickets now on cineBook"}
        image={movie.poster}
        url={`/movie/${movie._id}`}
      />
      
      {/* Premium Hero Banner */}
      <div 
        className="relative min-h-[480px] w-full flex items-center bg-cover bg-center overflow-hidden py-10 bg-slate-900" 
        style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="container mx-auto px-4 max-w-[1240px] relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-stretch text-white">
          <div 
            className={`relative w-[180px] sm:w-[240px] md:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ${movie.trailer ? 'cursor-pointer group' : ''}`}
            onClick={() => movie.trailer && window.open(movie.trailer, '_blank')}
          >
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            
            {movie.trailer && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass text-white text-[12px] md:text-[14px] font-semibold px-5 py-2 rounded-full flex items-center gap-2 border border-white/20 shadow-premium group-hover:bg-[#F84464] transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Trailer
              </div>
            )}

            {movie.isNowShowing ? (
              <div className="absolute bottom-0 left-0 w-full glass text-[12px] font-bold uppercase text-center tracking-[0.2em] text-white py-2 z-10">In cinemas</div>
            ) : movie.isUpcoming ? (
              <div className="absolute bottom-0 left-0 w-full bg-black/80 px-4 py-3 text-[13px] font-semibold text-center text-white z-10">
                Releasing on {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
              </div>
            ) : null}
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center w-full">
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-white leading-tight drop-shadow-lg">{movie.title}</h1>
            
            {movie.isUpcoming ? (
              <div className="glass rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-6 w-full max-w-[500px] mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-[#4caf50] text-2xl mt-0.5"><LuThumbsUp className="fill-current" /></span>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-[16px]">{formatCount(movie.interestCount)} are interested</span>
                    <span className="text-slate-200 text-[13px] font-medium mt-1">Mark interested to know when bookings open</span>
                  </div>
                </div>
                <button
                  className="bg-transparent hover:bg-white/20 border-2 border-white text-white px-6 py-2.5 text-[14px] font-bold rounded-xl transition-all whitespace-nowrap shadow-sm"
                  onClick={handleInterestClick}
                  disabled={toggleInterestMutation.isLoading}
                >
                  {user && movie.interestedUsers?.includes(user._id) ? "Interested ✅" : "I'm interested"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl w-fit flex-wrap justify-center shadow-premium mt-6">
                <span className="text-[#F84464] text-2xl drop-shadow-md">★</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white">{movie.rating?.toFixed(1) || 0}/10</span>
                <span className="text-[14px] text-slate-200 font-semibold ml-2">{reviews?.length || 0} Ratings &rsaquo;</span>
                <button className="bg-white text-[#F84464] hover:bg-slate-100 font-bold px-5 py-2.5 text-[13px] rounded-xl transition-colors ml-4 shadow-sm" onClick={() => document.getElementById("review-section").scrollIntoView({ behavior: "smooth" })}>Rate now</button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-6">
              <span className="bg-white text-slate-900 px-3 py-1.5 text-[13px] font-bold rounded shadow-sm">2D, 3D, IMAX</span>
              {Array.isArray(movie.language) ? (
                 movie.language.map((lang, idx) => <span key={idx} className="glass text-white px-3 py-1.5 text-[13px] font-bold rounded shadow-sm">{lang}</span>)
              ) : (
                <span className="glass text-white px-3 py-1.5 text-[13px] font-bold rounded shadow-sm">{movie.language}</span>
              )}
            </div>

            <div className="text-[14px] md:text-[16px] text-slate-200 font-medium tracking-wide mt-4">
              {movie.duration} • {movie.genre?.join(", ")} • UA • {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "TBA"}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap w-full md:w-auto gap-4 mt-8 items-center justify-center md:justify-start">
              {movie.itemType === "premiere" ? (
                <div className="fixed bottom-0 left-0 w-full p-4 glass z-[1000] sm:static sm:bg-transparent sm:border-none sm:p-0 sm:w-auto sm:z-auto flex flex-col sm:flex-row gap-3">
                  <button
                    className="w-full sm:w-auto bg-[#F84464] hover:bg-[#e03a58] text-white px-10 py-3.5 text-[16px] font-bold rounded-xl shadow-premium transition-transform hover:scale-105"
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: movie.basePrice || 149 } })}
                  >
                    Rent for ₹ {movie.basePrice || 149}
                  </button>
                  <button
                    className="w-full sm:w-auto glass hover:bg-white/20 text-white px-10 py-3.5 text-[16px] font-bold rounded-xl transition-all shadow-sm"
                    onClick={() => navigate(`/payment`, { state: { itemId: movie._id, isPremiere: true, totalAmount: (movie.basePrice || 149) + 400 } })}
                  >
                    Buy for ₹ {(movie.basePrice || 149) + 400}
                  </button>
                </div>
              ) : movie.isNowShowing ? (
                <div className="fixed bottom-0 left-0 w-full p-4 glass z-[1000] sm:static sm:bg-transparent sm:border-none sm:p-0 sm:w-auto sm:z-auto">
                  <button
                    className="w-full sm:w-auto bg-[#F84464] hover:bg-[#e03a58] text-white px-14 py-4 text-[16px] font-bold rounded-xl shadow-premium transition-transform hover:scale-105"
                    onClick={() => navigate(`/select-theatre/${movie._id}`)}
                  >
                    Book Tickets
                  </button>
                </div>
              ) : null}

              <button
                className="w-full sm:w-auto glass hover:bg-white/20 text-white px-5 py-4 text-[16px] font-bold transition-all flex items-center justify-center gap-2 rounded-xl shadow-sm"
                onClick={handleShare}
                title="Share"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto max-w-[1000px] px-4 py-12 flex flex-col gap-12">
        <section className="w-full">
          <h3 className="text-[22px] md:text-[26px] font-extrabold mb-4">About the movie</h3>
          <p className="text-[15px] md:text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">{movie.description}</p>
        </section>

        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {movie.cast?.length > 0 && (
          <section className="w-full">
            <h3 className="text-[22px] md:text-[26px] font-extrabold mb-6">Cast</h3>
            <div className="flex gap-4 md:gap-8 overflow-x-auto py-2 scrollbar-none">
              {movie.cast.map((c, idx) => (
                <div key={idx} className="w-[100px] md:w-[130px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-400 mb-4 shadow-sm group-hover:shadow-premium transition-all duration-300">
                    {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <span>{c.name.charAt(0)}</span>}
                  </div>
                  <span className="text-[14px] md:text-[16px] font-bold w-full block truncate group-hover:text-[#F84464] transition-colors">{c.name}</span>
                  <span className="text-[13px] text-slate-500 mt-1 block w-full truncate">Actor</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(movie.crew?.length > 0 || movie.director) && (
          <>
            <div className="h-px bg-slate-200 dark:bg-slate-800" />
            <section className="w-full">
              <h3 className="text-[22px] md:text-[26px] font-extrabold mb-6">Crew</h3>
              <div className="flex gap-4 md:gap-8 overflow-x-auto py-2 scrollbar-none">
                {movie.director && !movie.crew?.some(c => c.name === movie.director) && (
                  <div className="w-[100px] md:w-[130px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-400 mb-4 shadow-sm group-hover:shadow-premium transition-all duration-300">
                      <span>{movie.director.charAt(0)}</span>
                    </div>
                    <span className="text-[14px] md:text-[16px] font-bold w-full block truncate group-hover:text-[#F84464] transition-colors">{movie.director}</span>
                    <span className="text-[13px] text-slate-500 mt-1 block w-full truncate">Director</span>
                  </div>
                )}
                {movie.crew?.map((c, idx) => (
                  <div key={idx} className="w-[100px] md:w-[130px] flex-shrink-0 flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-400 mb-4 shadow-sm group-hover:shadow-premium transition-all duration-300">
                      {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <span>{c.name.charAt(0)}</span>}
                    </div>
                    <span className="text-[14px] md:text-[16px] font-bold w-full block truncate group-hover:text-[#F84464] transition-colors">{c.name}</span>
                    <span className="text-[13px] text-slate-500 mt-1 block w-full truncate">{c.role}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="h-px bg-slate-200 dark:bg-slate-800" />
        
        {/* Reviews Section */}
        <section className="w-full" id="review-section">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[22px] md:text-[26px] font-extrabold">Top Reviews</h3>
            <span className="text-[14px] md:text-[15px] font-semibold text-[#F84464]">{reviews?.length || 0} reviews &rsaquo;</span>
          </div>

          {user ? (
            !hasReviewed ? (
              <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl mb-10 max-w-[800px] shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-[18px] font-bold mb-6">Write a Review</h4>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-[140px] flex-shrink-0">
                    <label className="block text-[14px] font-bold text-slate-500 dark:text-slate-400 mb-3">Rating (1-10)</label>
                    <input 
                      type="number" 
                      min="1" max="10" 
                      className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition-all" 
                      value={reviewForm.rating} 
                      onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[14px] font-bold text-slate-500 dark:text-slate-400 mb-3">Your thoughts</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition-all" 
                      placeholder="What did you think of the movie?" 
                      value={reviewForm.comment} 
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="bg-[#F84464] hover:bg-[#e03a58] text-white px-8 py-3 text-sm font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" disabled={createReviewMutation.isLoading}>
                    Post Review
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-6 px-8 rounded-2xl text-center text-sm font-medium text-slate-500 mb-10 max-w-[800px]">
                You have already reviewed this movie. Thank you!
              </div>
            )
          ) : (
             <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-6 px-8 rounded-2xl text-center text-sm font-medium text-slate-500 mb-10 max-w-[800px]">
                Please log in to write a review.
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews?.map((r) => (
              <div key={r._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-premium transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-[#F84464] text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm">
                        {r.user?.avatar ? (
                          <img src={r.user.avatar} alt={r.user.name} className="w-full h-full object-cover" />
                        ) : (
                          r.user?.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-base">{r.user?.name || "Anonymous"}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Booked on cineBook</div>
                      </div>
                    </div>
                    <div className="text-[#F84464] font-bold text-sm bg-[#F84464]/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-lg leading-none">★</span> {r.rating}/10
                    </div>
                  </div>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                    "{r.comment}"
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="flex gap-6">
                    <button 
                      onClick={() => handleVote(r._id, "like")} 
                      className={`bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-[#F84464] transition-colors duration-150 ${r.likedBy?.includes(user?._id) ? "text-[#F84464]" : ""}`}
                    >
                      👍 {r.likes}
                    </button>
                    <button 
                      onClick={() => handleVote(r._id, "dislike")}
                      className={`bg-transparent border-none cursor-pointer flex items-center gap-2 hover:text-[#F84464] transition-colors duration-150 ${r.dislikedBy?.includes(user?._id) ? "text-[#F84464]" : ""}`}
                    >
                      👎 {r.dislikes}
                    </button>
                  </div>
                  <div className="text-[12px] opacity-70">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
            {(!reviews || reviews.length === 0) && (
              <div className="col-span-full text-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-lg font-medium">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </section>

        {/* Recommendations */}
        {recommendations?.length > 0 && (
          <>
            <div className="h-px bg-slate-200 dark:bg-slate-800" />
            <section className="w-full">
              <h3 className="text-[22px] md:text-[26px] font-extrabold mb-6">You Might Also Like</h3>
              <ScrollContainer className="py-4 gap-6">
                {recommendations.map(rec => (
                  <Link 
                    to={`/movie/${rec._id}`} 
                    key={rec._id} 
                    className="w-[140px] sm:w-[160px] md:w-[200px] flex-shrink-0 group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-premium transition-all duration-300 bg-slate-100 dark:bg-slate-800">
                      <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                    </div>
                    <h4 className="text-[15px] md:text-[17px] font-bold mt-4 truncate group-hover:text-[#F84464] transition-colors">{rec.title}</h4>
                    <p className="text-[13px] text-slate-500 mt-1 truncate">{rec.genre?.join(" • ")}</p>
                  </Link>
                ))}
              </ScrollContainer>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
