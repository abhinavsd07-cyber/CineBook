import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import SEO from "../components/SEO";

export default function TicketScanner() {
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Only init once
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = async (decodedText) => {
      // Pause scanning on success to prevent multiple API calls
      scanner.pause();

      setStatus("loading");
      setMessage("Verifying ticket...");

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/verify-ticket/${decodedText}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus("success");
        setMessage(`✅ ${res.data.message}\nUser: ${res.data.data.user}\nSeats: ${res.data.data.seats.join(", ")}`);
        
        // Play success sound
        const audio = new Audio("https://actions.google.com/sounds/v1/ui/beep_short.ogg");
        audio.play().catch(() => console.log("Audio play prevented"));

      } catch (err) {
        setStatus("error");
        setMessage(`❌ ${err.response?.data?.message || "Invalid Ticket!"}`);
        
        // Play error sound
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play().catch(() => console.log("Audio play prevented"));
      }

      // Resume scanning after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
        scanner.resume();
      }, 4000);
    };

    scanner.render(onScanSuccess, () => {
      // ignore frame errors
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text flex items-center justify-center transition-colors duration-300">
      <SEO 
        title="Staff Ticket Scanner" 
        description="Scan and verify QR tickets for fast entry at venues."
        url="/staff/scanner"
      />
      <style>{`
        #html5-qrcode-button-camera-start, 
        #html5-qrcode-button-camera-stop {
          background-color: #F84464;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin: 10px 5px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        #html5-qrcode-button-camera-start:hover, 
        #html5-qrcode-button-camera-stop:hover {
          background-color: #E03554;
        }
        #reader__dashboard_section_csr span {
          color: var(--color-bms-text) !important;
        }
        #reader__dashboard_section_swaplink {
          color: #F84464 !important;
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
      <div className="container px-4 mx-auto max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-bms-text tracking-tight">Staff Scanner</h1>
          <p className="text-bms-text-muted text-sm mt-1">Point camera at customer's QR code to admit</p>
        </div>

        <div className="bg-bms-surface border border-bms-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div id="reader" className="w-full rounded-xl overflow-hidden [&_video]:rounded-xl"></div>
          
          {status !== "idle" && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 backdrop-blur-md transition-all duration-300 ${
              status === "success" ? "bg-emerald-600/90 text-white" :
              status === "error" ? "bg-red-600/90 text-white" :
              "bg-black/80 text-white"
            }`}>
              <div className="text-center p-6">
                {status === "loading" && (
                  <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                )}
                <div className="whitespace-pre-line text-lg font-bold">
                  {message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
