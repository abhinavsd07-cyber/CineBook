import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaXTwitter, FaInstagram, FaYoutube, FaPinterestP, FaLinkedinIn } from "react-icons/fa6";

const Footer = () => (
  <footer className="bg-[#31353B] dark:bg-[#121620] text-[#9E9E9E] pt-8 pb-4 border-t border-bms-border/10 mt-auto" id="contact">
    {/* ── Footer Top Cards ── */}
    <div className="border-b border-bms-border/10 pb-6 mb-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto text-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/10 dark:bg-black/20 hover:text-white transition-all duration-200">
            <div className="text-3xl">🎧</div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">24/7 CUSTOMER CARE</h5>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/10 dark:bg-black/20 hover:text-white transition-all duration-200">
            <div className="text-3xl">🎟️</div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">RESEND BOOKING CONFIRMATION</h5>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/10 dark:bg-black/20 hover:text-white transition-all duration-200 sm:col-span-2 md:col-span-1">
            <div className="text-3xl">✉️</div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">SUBSCRIBE TO THE NEWSLETTER</h5>
          </div>
        </div>
      </div>
    </div>

    {/* ── Footer Main Links ── */}
    <div className="container mx-auto text-center px-4">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex-1 h-[1px] bg-bms-border/10"></div>
        <div className="mx-auto px-6 bg-[#31353B] dark:bg-[#121620]" style={{ display: "flex", justifyContent: "center" }}>
           <img src="/logo.svg" alt="cineBook" className="h-10 w-auto" />
        </div>
        <div className="flex-1 h-[1px] bg-bms-border/10"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-[900px] mx-auto text-left mb-10">
        <div className="flex flex-col gap-3">
          <h6 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400">MOVIES</h6>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Now Showing</Link></li>
            <li><Link to="/explore" className="text-[13px] hover:text-white transition-colors duration-150">Coming Soon</Link></li>
            <li><Link to="/explore" className="text-[13px] hover:text-white transition-colors duration-150">Movie Reviews</Link></li>
            <li><Link to="/explore" className="text-[13px] hover:text-white transition-colors duration-150">Cinemas</Link></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h6 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400">EVENTS</h6>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Comedy Shows</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Music Concerts</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Workshops</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Meetups</Link></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h6 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400">HELP</h6>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">About Us</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Contact Us</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Current Openings</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Press Coverage</Link></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h6 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-400">LEGAL</h6>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Terms & Conditions</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Privacy Policy</Link></li>
            <li><Link to="/" className="text-[13px] hover:text-white transition-colors duration-150">Consumer Grievance</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[20px] transition-colors duration-200"><FaFacebookF /></a>
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[20px] transition-colors duration-200"><FaXTwitter /></a>
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[22px] transition-colors duration-200"><FaInstagram /></a>
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[22px] transition-colors duration-200"><FaYoutube /></a>
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[20px] transition-colors duration-200"><FaPinterestP /></a>
        <a href="#" className="w-11 h-11 rounded-full bg-[#555555] hover:bg-white text-[#31353B] flex items-center justify-center text-[20px] transition-colors duration-200"><FaLinkedinIn /></a>
      </div>

      <div className="max-w-[1000px] mx-auto text-[11px] text-slate-500 leading-relaxed text-center mt-6">
        <p>
          Copyright {new Date().getFullYear()} © Bigtree Entertainment Pvt. Ltd. All Rights Reserved.
          <br />
          The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
