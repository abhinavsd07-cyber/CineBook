import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LuMessageSquare, LuX, LuSend, LuBot } from 'react-icons/lu';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const location = useLocation();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am CineBot 🤖. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getBotResponse = (text) => {
    const lower = text.toLowerCase();
    
    if (lower.includes('book') || lower.includes('ticket') || lower.includes('buy')) {
      return 'To book a ticket, simply browse movies on the Home or Explore page, click on a movie, and hit "Book tickets". You can then select your theatre, date, time, and seats!';
    }
    if (lower.includes('where') || lower.includes('find') || lower.includes('history') || lower.includes('my bookings')) {
      return 'You can view all your purchased tickets by navigating to your Profile and clicking on "My Bookings". You can even download them as PDFs or add them to your calendar!';
    }
    if (lower.includes('cancel') || lower.includes('refund') || lower.includes('money')) {
      return 'You can cancel any upcoming booking in the "My Bookings" section. Once cancelled, your money will be automatically refunded via the original payment method.';
    }
    if (lower.includes('coin') || lower.includes('loyalty') || lower.includes('discount')) {
      return 'CineCoins are our loyalty rewards! You earn 5% back on every booking. You can use your CineCoins on the payment page for an instant discount on future tickets.';
    }
    if (lower.includes('food') || lower.includes('popcorn') || lower.includes('beverage')) {
      return 'Yes! We offer a variety of Food & Beverage options. You can add popcorn, nachos, and drinks to your order during the booking process.';
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return 'Hello there! Enjoying cineBook? Let me know if you need help finding a movie or managing your tickets.';
    }

    return "I'm still learning! For complex issues, please reach out to our support team at support@cinebook.com.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      const botResponse = getBotResponse(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {isOpen && (
        <div className="w-[320px] md:w-[360px] h-[450px] bg-bms-surface border border-bms-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up mb-4">
          <div className="flex items-center gap-3 bg-bms-header text-white px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-lg">
              <LuBot />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">CineBot Support</h4>
              <span className="text-[10px] text-green-400 font-medium block">Online</span>
            </div>
            <button className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors duration-200 border-none cursor-pointer" onClick={() => setIsOpen(false)}>
              <LuX size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-bms-bg/50">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                  m.sender === 'bot' 
                    ? 'self-start bg-bms-surface border border-bms-border text-bms-text rounded-tl-none' 
                    : 'self-end bg-bms-accent text-white rounded-tr-none'
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="flex items-center gap-2 p-3 border-t border-bms-border bg-bms-surface" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type your question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-bms-bg border border-bms-border rounded-md text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="w-9 h-9 rounded-md bg-bms-accent/10 hover:bg-bms-accent text-bms-accent hover:text-white flex items-center justify-center border-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:hover:bg-bms-accent/10 disabled:hover:text-bms-accent"
            >
              <LuSend size={14} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="w-14 h-14 rounded-full bg-bms-accent hover:bg-bms-accent-hover text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-200 border-none cursor-pointer focus:outline-none" onClick={() => setIsOpen(true)}>
          <LuMessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
