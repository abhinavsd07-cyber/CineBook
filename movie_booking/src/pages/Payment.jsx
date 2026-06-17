import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import { createPaymentIntent, createBooking, getMovieById, validateCoupon } from "../config/allApis";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51234");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#333333",
      fontFamily: "'Inter', sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#999999" },
      iconColor: "#666666",
    },
    invalid: { color: "#F84464", iconColor: "#F84464" },
  },
  hidePostalCode: true,
};

function CheckoutForm({ show, premiereItem, selectedSeats, foodItems, grandTotal, itemId, initialAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !name) return;

    setProcessing(true);
    setCardError("");

    try {
      let stripePaymentIntentId = `zero_amount_${Date.now()}`;
      
      if (grandTotal >= 1) {
        const piRes = await createPaymentIntent({ amount: grandTotal });
        const { clientSecret } = piRes.data.data;

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name, email },
          },
        });

        if (error) {
          setCardError(error.message);
          setProcessing(false);
          return;
        }
        stripePaymentIntentId = paymentIntent.id;
      }

      const bookingData = {
        showId: show?._id,
        itemId: premiereItem?._id || itemId || show?.movie?._id,
        seats: selectedSeats?.map((s) => ({ type: s.type, seatNumber: s.id })),
        foodItems,
        stripePaymentIntentId,
        useCoins: window.useCoinsGlobal,
        totalAmount: initialAmount
      };

      const bookingRes = await createBooking(bookingData);
      navigate("/payment-success", { state: { booking: bookingRes.data.data } });
    } catch (err) {
      setCardError(err.response?.data?.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-[#333333] mb-2" htmlFor="cardholder-name">Cardholder Name</label>
        <input
          id="cardholder-name"
          type="text"
          className="w-full px-3 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-slate-400 transition-colors"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-[#333333] mb-2" htmlFor="cardholder-email">Email for Receipt</label>
        <input
          id="cardholder-email"
          type="email"
          className="w-full px-3 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-slate-400 transition-colors"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-medium text-[#333333] mb-2">Card Details</label>
        <div className="w-full border border-slate-200 bg-slate-50 p-3 rounded-[4px] focus-within:border-slate-400 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {cardError && <div className="text-red-500 text-[12px] font-medium mb-4">{cardError}</div>}

      <button
        type="submit"
        className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3.5 rounded-[8px] font-semibold text-[15px] w-full shadow-md shadow-[#F84464]/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>Processing...</>
        ) : (
          `Pay Rs. ${grandTotal}`
        )}
      </button>

      <div className="text-center text-[11px] text-[#999999] mt-4 flex items-center justify-center gap-1">
        <span>By proceeding, I express my consent to complete this transaction.</span>
      </div>
    </form>
  );
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const { bookingDetails, foodItems } = state || {};
  const { show, itemId, selectedSeats, isPremiere, isEvent, eventItem } = bookingDetails || state || {};

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiApp, setUpiApp] = useState("gpay");
  const [processing, setProcessing] = useState(false);
  const [premiereItem, setPremiereItem] = useState(eventItem || null);
  const [loading, setLoading] = useState(isPremiere && !eventItem);

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const [cineCoins, setCineCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  useEffect(() => {
    import("../config/allApis").then(({ getProfile }) => {
      getProfile().then(res => setCineCoins(res.data.data.cineCoins || 0)).catch(err => console.error(err));
    });
  }, []);

  useEffect(() => {
    window.useCoinsGlobal = useCoins;
  }, [useCoins]);

  useEffect(() => {
    if (isPremiere && itemId && !eventItem) {
      getMovieById(itemId)
        .then((r) => setPremiereItem(r.data.data))
        .catch(() => navigate("/"))
        .finally(() => setLoading(false));
    }
  }, [isPremiere, itemId, eventItem, navigate]);

  useEffect(() => {
    if (!show && !isPremiere && !isEvent) {
      navigate("/");
    }
  }, [show, isPremiere, isEvent, navigate]);

  if (!show && !isPremiere && !isEvent) {
    return null;
  }

  if (loading) return <div className="min-h-screen pt-20 flex justify-center items-center"><div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" /></div>;

  const initialAmount = Number(bookingDetails?.totalAmount || state?.totalAmount || premiereItem?.basePrice || 0) || 0;
  const foodTotal = foodItems?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const convenienceFee = state?.convenienceFee ?? Math.round(initialAmount * 0.05);
  const gst = state?.gst ?? Math.round(initialAmount * 0.18);
  const discountAmount = Math.round(((initialAmount + foodTotal) * appliedDiscount) / 100);
  
  let preCoinTotal = initialAmount + foodTotal + convenienceFee + gst - discountAmount;
  let coinDiscount = 0;

  if (useCoins && cineCoins > 0) {
    if (cineCoins >= preCoinTotal) {
      coinDiscount = preCoinTotal;
    } else {
      coinDiscount = cineCoins;
    }
  }

  const grandTotal = preCoinTotal - coinDiscount;

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await validateCoupon({ code: promoCode });
      setAppliedDiscount(res.data.data.discountPercent);
      setPromoSuccess(`Coupon applied! ${res.data.data.discountPercent}% off`);
    } catch (err) {
      setPromoError(err.response?.data?.message || "Invalid promo code");
      setAppliedDiscount(0);
    }
  };

  const handleUpiPayment = async () => {
    setProcessing(true);
    try {
      const bookingData = {
        showId: show?._id,
        itemId: premiereItem?._id || itemId || show?.movie?._id,
        seats: selectedSeats?.map((s) => ({ type: s.type, seatNumber: s.id })),
        foodItems,
        stripePaymentIntentId: `mock_upi_${upiApp}_${Date.now()}`,
        useCoins,
        totalAmount: initialAmount
      };

      const bookingRes = await createBooking(bookingData);
      navigate("/payment-success", { state: { booking: bookingRes.data.data } });
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f5f9] pt-[105px] md:pt-[115px] pb-12 font-sans animate-fade-in">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Order Summary (Right on Desktop, Top on Mobile) */}
          <div className="w-full lg:w-1/3 order-1 lg:order-2 sticky top-[115px]">
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-200 p-6 animate-slide-up">
              <h2 className="text-[16px] font-medium text-[#333333] mb-4 border-b border-slate-200 pb-3">Order Summary</h2>

              {isPremiere || isEvent ? (
                <div className="mb-4 bg-[#fcfcfc] p-4 rounded-[8px] border border-slate-200">
                  <h3 className="font-bold text-[#333333] text-[16px]">{premiereItem?.title}</h3>
                  <p className="text-[12px] font-normal text-slate-500 mt-1">
                    {isEvent ? `Live Event • ${premiereItem?.eventLocation || "Venue TBA"}` : `Premiere Stream • ${premiereItem?.language?.join(", ")}`}
                  </p>
                </div>
              ) : (
                <div className="mb-4 bg-[#fcfcfc] p-4 rounded-[8px] border border-slate-200">
                  <h3 className="font-bold text-[#333333] text-[16px]">{show.movie?.title}</h3>
                  <p className="text-[12px] font-normal text-slate-500 mt-1">{Array.isArray(show.movie?.language) ? show.movie?.language.join(", ") : show.movie?.language} • {show.format}</p>
                  <p className="text-[12px] font-normal text-slate-500 mt-0.5">{show.theatre?.name}: {show.theatre?.location}</p>
                </div>
              )}

              <div className="space-y-2 mb-4 text-[13px] font-medium text-[#666666]">
                {!isPremiere && (
                  <div className="flex justify-between items-center text-[#333333]">
                    <span>{selectedSeats?.map(s => s.id).join(", ")} ({selectedSeats?.length} Tickets)</span>
                    <span className="font-medium">Rs. {initialAmount}</span>
                  </div>
                )}
                
                {foodItems && foodItems.length > 0 && (
                  <>
                    <div className="flex justify-between items-center text-[#333333] mt-2 pt-2 border-t border-slate-200">
                      <span>Food & Beverage</span>
                      <span className="font-medium">Rs. {foodTotal}</span>
                    </div>
                    <div className="pl-2 mb-2 space-y-1">
                      {foodItems.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] text-slate-500 font-normal">
                          <span>{f.quantity}x {f.name}</span>
                          <span>Rs. {f.price * f.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center">
                  <span>Convenience fees</span>
                  <span>Rs. {convenienceFee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Base GST</span>
                  <span>Rs. {gst}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center font-medium text-[#4CAF50] mt-1">
                    <span>Promo Discount ({appliedDiscount}%)</span>
                    <span>- Rs. {discountAmount}</span>
                  </div>
                )}
                {coinDiscount > 0 && (
                  <div className="flex justify-between items-center font-medium text-amber-500 mt-1">
                    <span>CineCoins Applied</span>
                    <span>- Rs. {coinDiscount}</span>
                  </div>
                )}
              </div>

              {cineCoins > 0 && (
                <div className="bg-amber-50 p-4 rounded-[8px] border border-amber-200 mb-4 flex justify-between items-center">
                  <div>
                    <h4 className="m-0 text-amber-600 flex items-center gap-1 font-bold text-[13px]">🪙 CineCoins Balance: {cineCoins}</h4>
                    <p className="m-0 mt-1 text-[11px] text-amber-700/80 font-normal">Use your coins to get an instant discount!</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" className="sr-only peer" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              )}

              <div className="mb-4 pt-4 border-t border-slate-200">
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-slate-400 transition-colors uppercase" 
                    placeholder="Enter Promo Code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button className="border border-[#F84464] text-[#F84464] hover:bg-red-50 px-4 py-2 text-[12px] font-semibold rounded-[4px] transition-colors cursor-pointer" onClick={handleApplyPromo}>Apply</button>
                </div>
                {promoError && <div className="text-[11px] text-red-500 mt-1.5 font-medium px-1">{promoError}</div>}
                {promoSuccess && <div className="text-[11px] text-[#4CAF50] bg-green-50 p-2 rounded border border-[#4CAF50]/20 mt-1.5 font-medium">{promoSuccess}</div>}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center bg-[#fcfcfc] p-4 rounded-[8px]">
                <span className="font-bold text-[#333333] text-[15px]">Amount Payable</span>
                <span className="font-bold text-[#F84464] text-[18px]">Rs. {grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods (Left on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-2/3 order-2 lg:order-1">
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-200 p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-[16px] font-medium text-[#333333] mb-6 border-b border-slate-200 pb-3">Payment Options</h2>
              
              {grandTotal === 0 ? (
                <div className="text-center py-8 bg-[#fcfcfc] rounded-[8px] border border-slate-200">
                  <h3 className="text-[#F84464] font-bold text-[18px] mb-2">Fully Covered!</h3>
                  <p className="text-[14px] font-normal text-[#666666] mb-6">Your order total is covered by your discounts. No payment required.</p>
                  <button 
                    className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3 rounded-[8px] font-semibold w-full max-w-[200px] mx-auto shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                    onClick={async () => {
                      setProcessing(true);
                      try {
                        const bookingData = {
                          showId: show?._id,
                          itemId: premiereItem?._id || itemId || show?.movie?._id,
                          seats: selectedSeats?.map((s) => ({ type: s.type, seatNumber: s.id })),
                          foodItems,
                          stripePaymentIntentId: "free_booking_" + Date.now(),
                          useCoins,
                          totalAmount: initialAmount
                        };
                        const { createBooking } = await import("../config/allApis");
                        const bookingRes = await createBooking(bookingData);
                        navigate("/payment-success", { state: { booking: bookingRes.data.data } });
                      } catch (err) {
                        console.error(err);
                        alert("Booking failed. Please try again.");
                        setProcessing(false);
                      }
                    }}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Complete Booking"}
                  </button>
                </div>
              ) : grandTotal < 1 ? (
                <div className="animate-fade-in text-center py-4">
                  <h3 className="text-[18px] font-bold text-[#333333] mb-2">Free Booking</h3>
                  <p className="text-[13px] text-[#666666] mb-6">Your total is fully covered! No payment required.</p>
                  <button
                    className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3.5 rounded-[8px] font-semibold text-[15px] w-full shadow-md transition-all duration-200 cursor-pointer"
                    onClick={handleUpiPayment}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex border-b border-slate-200 mb-6">
                    <button 
                      className={`flex-1 py-3 px-4 text-[14px] font-medium transition-colors border-b-2 flex justify-center items-center gap-2 cursor-pointer ${paymentMethod === 'upi' ? 'text-[#F84464] border-[#F84464]' : 'text-slate-500 border-transparent hover:text-[#333333]'}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <span className="text-[18px]">📱</span> UPI
                    </button>
                    <button 
                      className={`flex-1 py-3 px-4 text-[14px] font-medium transition-colors border-b-2 flex justify-center items-center gap-2 cursor-pointer ${paymentMethod === 'card' ? 'text-[#F84464] border-[#F84464]' : 'text-slate-500 border-transparent hover:text-[#333333]'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <span className="text-[18px]">💳</span> Credit/Debit Card
                    </button>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="animate-fade-in">
                      <p className="text-[14px] font-medium text-[#333333] mb-4">Select your UPI App</p>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <button 
                          className={`flex flex-col items-center justify-center py-4 px-2 rounded-[8px] border transition-all cursor-pointer ${upiApp === 'gpay' ? 'border-[#F84464] bg-red-50' : 'border-slate-200 hover:border-slate-400 bg-white'}`}
                          onClick={() => setUpiApp('gpay')}
                        >
                          <SiGooglepay size={32} className="mb-2 text-[#333333]" />
                          <span className="text-[12px] font-medium text-[#333333]">GPay</span>
                        </button>
                        <button 
                          className={`flex flex-col items-center justify-center py-4 px-2 rounded-[8px] border transition-all cursor-pointer ${upiApp === 'phonepe' ? 'border-[#F84464] bg-red-50' : 'border-slate-200 hover:border-slate-400 bg-white'}`}
                          onClick={() => setUpiApp('phonepe')}
                        >
                          <SiPhonepe size={24} color="#5E5CE6" className="mb-3" />
                          <span className="text-[12px] font-medium text-[#333333]">PhonePe</span>
                        </button>
                        <button 
                          className={`flex flex-col items-center justify-center py-4 px-2 rounded-[8px] border transition-all cursor-pointer ${upiApp === 'paytm' ? 'border-[#F84464] bg-red-50' : 'border-slate-200 hover:border-slate-400 bg-white'}`}
                          onClick={() => setUpiApp('paytm')}
                        >
                          <SiPaytm size={32} color="#0F4A8A" className="mb-2" />
                          <span className="text-[12px] font-medium text-[#333333]">Paytm</span>
                        </button>
                      </div>
                      
                      <button 
                        className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3.5 rounded-[8px] font-semibold text-[15px] w-full shadow-md shadow-[#F84464]/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
                        onClick={handleUpiPayment}
                        disabled={processing}
                      >
                        {processing ? "Processing..." : `Pay Rs. ${grandTotal} via ${upiApp === 'gpay' ? 'GPay' : upiApp === 'phonepe' ? 'PhonePe' : 'Paytm'}`}
                      </button>
                      <div className="text-center text-[11px] text-[#999999] mt-4 flex items-center justify-center gap-1">
                        <span>By proceeding, I express my consent to complete this transaction.</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="animate-fade-in">
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          show={show}
                          premiereItem={premiereItem}
                          selectedSeats={selectedSeats}
                          foodItems={foodItems}
                          grandTotal={grandTotal}
                          itemId={itemId}
                          initialAmount={initialAmount}
                        />
                      </Elements>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
