import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Chat with Scooby‑Doo</h1>
      <ChatBot />
    </main>
  );
}
