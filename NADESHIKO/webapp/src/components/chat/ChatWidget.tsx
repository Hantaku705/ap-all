"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  dealsContext: string;
}

export default function ChatWidget({ dealsContext }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          dealsContext,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: data.error }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "エラーが発生しました。" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enter: 改行（何もしない、デフォルト動作を許可）
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }
    // Enter または Cmd+Enter: 送信
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* チャットウィンドウ */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[500px]">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">AI</span>
              <span className="text-white font-medium">アシスタント</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                <p>売上データについて質問してください</p>
                <p className="text-xs mt-2">例: 「今月のトップ担当者は？」</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="質問を入力... (Shift+Enterで改行)"
                disabled={loading}
                rows={1}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50 resize-none max-h-24 overflow-y-auto"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* チャットボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? "bg-gray-500 hover:bg-gray-600"
            : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
