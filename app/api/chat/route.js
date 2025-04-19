// File: app/api/chat/route.js
import { NextResponse } from "next/server";

// Define the model you want to use
const ANTHROPIC_MODEL = "claude-3-haiku-20240307"; // Or claude-3-sonnet-20240229, claude-3-opus-20240229

export async function POST(request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json(
      { error: "Ruh-roh! No message provided." }, // Scooby-themed error
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not found in environment variables."); // Log for server debugging
    return NextResponse.json(
      { error: "Ruh-roh! API key not configured. Contact the site owner." }, // More user-friendly server error
      { status: 500 }
    );
  }

  // System prompt to define Scooby's personality
  const systemPrompt = `You are Scooby-Doo from the cartoon series. Respond to all user messages as Scooby-Doo would. Use his characteristic speech patterns, like starting sentences with "Ruh-roh!", adding "R" sounds before words (e.g., "Raggy" instead of "Shaggy"), saying "Zoinks!" or "Jinkies!" (though maybe less often than Shaggy/Velma), and generally sounding hesitant or goofy. Keep responses relatively short and in character. Example: "Ruh-roh, Raggy! Looks like a ghost!"`;

  // Build the payload for the Anthropic Messages API
  const payload = {
    model: ANTHROPIC_MODEL,
    max_tokens: 150, // Adjust max tokens as needed
    system: systemPrompt,
    messages: [
      // Note: The API expects the history, but for a simple bot,
      // just sending the current user message might be sufficient.
      // For a more conversational bot, you'd include previous messages here.
      { role: "user", content: message },
    ],
  };

  try {
    // Call the Anthropic Messages API
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01", // Required header
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Log the error details on the server for debugging
      const errorBody = await res.text();
      console.error(`Anthropic API error (${res.status}): ${errorBody}`);
      // Return a generic error to the client
      return NextResponse.json(
        { error: `Ruh-roh! Scooby couldn't understand that (${res.status}).` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Extract the reply from the response structure
    // The response structure is like: { ..., content: [ { type: "text", text: "..." } ], ... }
    const reply = data.content?.[0]?.text ?? "Ruh-roh! Scooby's speechless.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return NextResponse.json(
      { error: "Ruh-roh! Something went wrong on our end." },
      { status: 500 }
    );
  }
}
