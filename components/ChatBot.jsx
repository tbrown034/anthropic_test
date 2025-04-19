// File: components/ChatBot.jsx
"use client";

import { useState, useRef, useEffect } from "react";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Auto‑scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // append user message
    setMessages((msgs) => [...msgs, { from: "user", text }]);
    setInput("");
    setLoading(true);

    let botReply = "Ruh‑roh! Something went wrong."; // Default error message

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      // Check if the response was okay (status 200-299)
      if (!res.ok) {
        // Try to get the error message from the API response body
        const errorData = await res.json();
        // Use the error message from API if available, otherwise keep the default
        throw new Error(
          errorData.error || `Request failed with status ${res.status}`
        );
      }

      const { reply } = await res.json();
      botReply = reply; // Set bot reply on success
    } catch (error) {
      // If an error occurred (network, API error, etc.), use the error message
      console.error("Chatbot error:", error); // Log the full error for debugging
      botReply = error.message || "Ruh-roh! An unexpected error occurred."; // Display the caught error message
    } finally {
      setMessages((msgs) => [...msgs, { from: "bot", text: botReply }]);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 w-full">
      {" "}
      {/* Added w-full */}
      <div className="h-80 p-4 bg-white/80 dark:bg-gray-800 rounded-lg overflow-y-auto mb-4 border border-gray-300 dark:border-gray-700">
        {" "}
        {/* Added border */}
        {messages.map((m, i) => (
          <div
            key={i} // Using index as key is okay for this simple append-only list
            className={`mb-2 flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`px-3 py-1 rounded-lg shadow-sm ${
                // Added rounded-lg and shadow
                m.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-green-600 text-white" // Kept Scooby's color green
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && (
          <p className="text-center italic text-gray-500 dark:text-gray-400">
            Scooby is thinking…
          </p>
        )}{" "}
        {/* Centered loading */}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Say something like, Scooby…" // Adjusted placeholder
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" // Adjusted styling
        />
        <button
          type="submit"
          disabled={loading || !input.trim()} // Disable if loading or input is empty/whitespace
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" // Adjusted styling & added disabled check for empty input
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
