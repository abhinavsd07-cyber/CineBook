import React, { useState } from "react";
import { LuSearch, LuCreditCard, LuSmartphone, LuWallet, LuClock, LuTicket, LuClapperboard } from "react-icons/lu";

const CATEGORIES = [
  { name: "Credit Card", icon: LuCreditCard },
  { name: "Debit Card", icon: LuCreditCard },
  { name: "BookMyShow", icon: LuTicket },
  { name: "UPI", icon: LuSmartphone },
  { name: "Cinema", icon: LuClapperboard },
  { name: "Wallet", icon: LuWallet },
  { name: "Pay Later", icon: LuClock }
];

const OFFERS_DATA = [
  // Credit Card
  {
    id: 1,
    bankName: "AU Zenith+ Credit Card",
    description: "Buy One ticket and Get One Free up to INR500* with AU Zenith+ Credit Card",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/AU-Bank-new-logo-for-GBM_1024X1024.png",
  },
  {
    id: 2,
    bankName: "AURUM Card",
    description: "Get 4 movie tickets or INR 1000 once a month with AURUM credit card.",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
  },
  {
    id: 3,
    bankName: "Axis Bank Indigo Credit Card",
    description: "Buy One Ticket, Get One Free using Axis Bank Indigo Credit Card",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg",
  },
  {
    id: 4,
    bankName: "Axis Bank Neo Card",
    description: "Get 10% discount on movie tickets when you transact using your Axis Bank Neo and IndianOil Axis Bank Credit Card",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg",
  },
  {
    id: 5,
    bankName: "DCB novio Credit Card Offer",
    description: "Buy one ticket and Get One ticket free with DCB novio Credit Cards T&C Apply*",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Development_Credit_Bank.svg",
  },
  {
    id: 6,
    bankName: "Federal Bank",
    description: "Get 10% Off up to INR200* with Federal Bank Credit Card",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Federal_bank.logo.svg",
  },
  {
    id: 7,
    bankName: "HDFC Bank Diner Club Privilege Card",
    description: "Get upto INR 250 per ticket on group booking using HDFC Bank Diners Club Privilege credit card *T&C Apply",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
  },
  {
    id: 8,
    bankName: "HDFC Bank Times Card",
    description: "Get 25% discount on movie tickets with HDFC Timescard Credit & 50% discount on movie tickets with HDFC Timescard Credit ...",
    category: "Credit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
  },
  // Debit Card
  {
    id: 9,
    bankName: "SBI Debit Card",
    description: "Get 10% discount on movie tickets with SBI Debit Card.",
    category: "Debit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
  },
  {
    id: 10,
    bankName: "ICICI Bank Debit Card",
    description: "Buy 1 Get 1 free on movie tickets with ICICI Bank Coral Debit Card.",
    category: "Debit Card",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
  },
  // BookMyShow
  {
    id: 11,
    bankName: "BookMyShow Blockbuster",
    description: "Flat ₹100 off on your first movie ticket booking.",
    category: "BookMyShow",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/BookMyShow_Logo.png",
  },
  // UPI
  {
    id: 12,
    bankName: "Google Pay Offer",
    description: "Win a scratch card worth up to ₹150 on your first UPI transaction on BookMyShow.",
    category: "UPI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
  },
  {
    id: 13,
    bankName: "PhonePe UPI",
    description: "Get 50% cashback up to ₹100 on your first PhonePe transaction.",
    category: "UPI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a4/PhonePe_Logo.svg",
  },
  // Cinema
  {
    id: 14,
    bankName: "PVR Cinemas",
    description: "Free Popcorn upgrade on all ticket bookings at PVR.",
    category: "Cinema",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/PVR_Cinemas_logo.svg",
  },
  // Wallet
  {
    id: 15,
    bankName: "Mobikwik Wallet",
    description: "Get up to ₹200 cashback on paying via Mobikwik.",
    category: "Wallet",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/MobiKwik_Logo.png",
  },
  {
    id: 16,
    bankName: "Paytm Wallet",
    description: "Flat ₹50 cashback on movie tickets via Paytm Wallet.",
    category: "Wallet",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg",
  },
  // Pay Later
  {
    id: 17,
    bankName: "Simpl Pay Later",
    description: "Get 10% cashback up to ₹150 on your first Simpl transaction.",
    category: "Pay Later",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/BookMyShow_Logo.png",
  },
];

export default function Offers() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Credit Card");

  const filteredOffers = OFFERS_DATA.filter(offer => 
    offer.category === activeCategory &&
    (offer.bankName.toLowerCase().includes(search.toLowerCase()) || 
     offer.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-[105px] md:pt-[120px] pb-16 min-h-[calc(100vh-100px)] bg-[#f2f5f9] text-[#333333] font-sans">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-[320px] flex-shrink-0 bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
          {/* Search Box */}
          <div className="p-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 bg-[#f2f5f9] rounded-[4px] px-3 h-10 w-full border border-transparent focus-within:border-slate-300 transition-colors">
              <LuSearch size={16} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search by bank name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#333333] placeholder-slate-500 w-full"
              />
            </div>
          </div>

          {/* Categories */}
          <ul className="flex flex-col m-0 p-0 list-none">
            {CATEGORIES.map((cat) => (
              <li 
                key={cat.name} 
                className={`px-6 py-4 text-[14px] cursor-pointer transition-colors border-l-4 border-b border-b-slate-100 last:border-b-0 flex items-center gap-4 ${
                  activeCategory === cat.name 
                    ? "bg-[#fff3f4] text-[#333333] border-l-[#F84464] border-t border-t-slate-100" 
                    : "bg-white text-[#333333] hover:bg-slate-50 hover:text-[#333333] border-l-transparent"
                }`}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setSearch("");
                }}
              >
                <cat.icon size={18} className={activeCategory === cat.name ? "text-[#F84464]" : "text-slate-400"} />
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Offers Grid */}
        <main className="flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white border border-slate-200 rounded-[4px] shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow">
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top: Logo + Bank Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 border border-slate-200 rounded-[4px] flex items-center justify-center p-1 bg-white">
                      <img 
                        src={offer.logo} 
                        alt={offer.bankName} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <h3 className="text-[13px] font-medium text-[#333333] m-0">{offer.bankName}</h3>
                  </div>

                  {/* Middle: Description */}
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-[#333333] leading-snug mb-3">
                      {offer.description}
                    </p>
                    <p className="text-[12px] text-slate-500 m-0">Processing fee applicable</p>
                  </div>
                </div>

                {/* Bottom: View Details */}
                <div className="px-5 py-3 border-t border-slate-200 text-[#333333] text-[13px] font-normal hover:text-[#F84464] transition-colors flex items-center gap-1">
                  View details <span className="text-[10px] opacity-70">›</span>
                </div>
              </div>
            ))}
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-20 text-slate-500 bg-white border border-slate-200 rounded-[4px] shadow-sm">
              <p className="text-[14px]">No offers found for "{search}" in {activeCategory}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
