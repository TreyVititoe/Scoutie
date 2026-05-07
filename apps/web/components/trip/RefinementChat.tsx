"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TripItem = {
  itemType: string;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  estimatedCost: number;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  rating: number | null;
};

type TripDay = {
  dayNumber: number;
  title: string;
  summary?: string;
  estimatedCost?: number;
  items: TripItem[];
};

type Trip = {
  tier: string;
  title: string;
  summary: string;
  destination: string;
  totalEstimatedCost: number;
  days: TripDay[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_SUGGESTIONS = [
  "Make day 3 more relaxed",
  "Add more food spots",
  "Find cheaper hotels",
  "Add a day trip",
];

export default function RefinementChat({
  trip,
  onTripUpdate,
}: {
  trip: Trip;
  onTripUpdate: (updated: Trip) => void;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I'm Walter. Tell me how you'd like to adjust your itinerary and I'll make it happen.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const storedPrefs = localStorage.getItem("walter_prefs");
      const quizData = storedPrefs ? JSON.parse(storedPrefs) : {};

      const res = await fetch("/api/trips/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, trip, quizData }),
      });

      const data = await res.json();

      if (data.trip) {
        onTripUpdate(data.trip);
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content:
            data.message ||
            "Done -- I've updated your itinerary. Take a look at the changes above.",
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Something went wrong while updating the trip. Try again with a different request.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Could not reach the server. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-[400px] h-[500px] card-base flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="bg-accent px-5 py-3.5 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-white font-sans font-semibold text-sm">
                  Walter
                </p>
                <p className="text-white/60 text-xs font-sans">
                  Refine your itinerary
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-[14px] text-sm font-sans leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : "bg-page-bg text-gray-dark"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-page-bg rounded-[14px] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions -- only show when few messages */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 text-xs font-sans font-medium rounded-pill border border-[rgba(194,85,56,0.08)] text-on-light-secondary hover:border-accent/30 hover:bg-accent/5 transition-colors"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-black/10 px-4 py-3 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. swap the museum for a food tour"
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 rounded-[10px] border border-[rgba(194,85,56,0.08)] bg-white text-sm font-sans text-gray-dark placeholder:text-on-light-tertiary focus:outline-none focus:ring-accent/20 focus:ring-accent focus:ring-1 disabled:opacity-50 transition-colors"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="px-4 py-2.5 rounded-[10px] bg-accent text-white text-sm font-sans font-semibold hover:bg-accent-light transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-accent text-white shadow-elevated hover:bg-accent/90 transition-all flex items-center justify-center"
            aria-label="Open refinement chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
