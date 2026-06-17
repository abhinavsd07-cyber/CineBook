import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPremieres } from "../config/allApis";
import SEO from "../components/SEO";

export default function Stream() {
  const [premieres, setPremieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchStreamData = async () => {
      try {
        const res = await getPremieres();
        if (active) setPremieres(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStreamData();
    return () => { active = false; };
  }, []);

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-[#121528] text-white transition-colors duration-300">
      <SEO title="Stream - Rent or Buy Latest Movies | Book My Show" />
      
      <section className="relative min-h-[220px] bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 py-12 mb-10 flex items-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 flex flex-col justify-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">BMS Stream</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 font-medium">Brand new releases every Friday. Rent or Buy.</p>
        </div>
      </section>

      <div className="container relative z-10 -mt-10 px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-1">Premiering Now</h2>
        <p className="text-xs text-slate-400 mb-8">Watch the latest movies from the comfort of your home</p>
        
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-3 border-slate-700 border-t-bms-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {premieres.length > 0 ? (
              premieres.map((m) => (
                <div key={m._id} className="cursor-pointer group flex flex-col" onClick={() => navigate(`/movie/${m._id}`)}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                    <div className="absolute top-3 left-3 bg-bms-accent text-white text-[9px] font-bold py-1 px-2 rounded-sm shadow-md">PREMIERE</div>
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-white mt-3 truncate group-hover:text-bms-accent transition-colors duration-200">{m.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 truncate">{Array.isArray(m.language) ? m.language.join(", ") : m.language}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-slate-400 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">
                No Premieres available right now. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
