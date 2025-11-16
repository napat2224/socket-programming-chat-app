"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket connection URL - adjust port if needed
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setSocket(ws);
      socketRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <div className="w-full min-h-screen bg-primary p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-end">
        <div className="flex items-center bg-neutral-white text-neutral-black gap-2 px-4 py-2 rounded-full shadow">
          <span>Username</span>
          <div className="w-7 h-7 bg-amber-600 rounded-full">{/* img */}</div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-sm">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Online Users */}
      <h2 className="text-lg font-semibold">Online user</h2>
      <div className="flex items-center gap-4">
        {/* Empty avatar placeholders */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-30 h-30 bg-neutral-white rounded-full shadow-md"
          ></div>
        ))}
      </div>

      {/* Joined Chat */}
      <h2 className="text-lg font-semibold mt-4">Joined chat</h2>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-full p-4 rounded-xl flex justify-between items-center shadow bg-neutral-white text-neutral-black"
          >
            <span className="text-base">ธรรมะยามเช้า (48)</span>
            <button className="px-6 py-2 rounded-full bg-neutral-black text-neutral-white">
              เข้าร่วม
            </button>
          </div>
        ))}
      </div>

      {/* Public Chat */}
      <h2 className="text-lg font-semibold mt-4">Public chat</h2>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-full p-4 rounded-xl flex justify-between items-center shadow bg-neutral-white text-neutral-black"
          >
            <span className="text-base">ธรรมะยามเช้า (48)</span>
            <button className="px-6 py-2 rounded-full bg-neutral-black text-neutral-white">
              เข้าร่วม
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

