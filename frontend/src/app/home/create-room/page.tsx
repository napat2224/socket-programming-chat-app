"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

interface WsMessage {
  type: string;
  status?: string;
  data: any;
}

type BackgroundColor = "red" | "blue" | "green" | "yellow" | "purple" | "pink" | "teal" | "orange" | "gray" | "black";

const BACKGROUND_COLORS: BackgroundColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "teal",
  "orange",
  "gray",
  "black",
];

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [selectedColor, setSelectedColor] = useState<BackgroundColor>("blue");
  const [isConnected, setIsConnected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("User not authenticated");
          router.push("/signin");
          return;
        }

        const token = await currentUser.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
        const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://");
        
        const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          wsRef.current = ws;
        };

        ws.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            console.log("Received message:", message);
            
            // Handle room creation success
            if (message.type === "create_room") {
              const roomData = typeof message.data === "string"
                ? JSON.parse(message.data)
                : message.data;
              
              console.log("Room created:", roomData);
              setIsCreating(false);
              // Navigate back to home page after successful creation
              router.push("/home");
            }
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
          wsRef.current = null;
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        connectWebSocket();
      } else {
        router.push("/signin");
      }
    });

    return () => {
      unsubscribe();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected. Please wait...");
      return;
    }

    setIsCreating(true);

    // Send create_room message via WebSocket
    // Backend expects WsMessage format: { type: "create_room", data: {...} }
    const createRoomData = {
      roomId: "",
      chatName: roomName.trim(),
      background: selectedColor,
    };

    const createRoomMessage = {
      type: "create_room",
      data: createRoomData,
    };

    try {
      wsRef.current.send(JSON.stringify(createRoomMessage));
      // Note: We'll navigate on successful response in the onmessage handler
    } catch (error) {
      console.error("Error sending create room message:", error);
      alert("Failed to create room. Please try again.");
      setIsCreating(false);
    }
    setIsCreating(false);
    router.push("/home")

  };

  return (
    <div className="w-full min-h-screen bg-primary p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/home")}
          className="px-4 py-2 rounded-full bg-neutral-white text-neutral-black hover:bg-gray-200"
        >
          ← Back
        </button>
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
      </div>

      {/* Create Room Form */}
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Create New Room</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Room Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="roomName" className="text-lg font-semibold">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-white text-neutral-black border-2 border-gray-300 focus:border-secondary focus:outline-none"
              disabled={isCreating || !isConnected}
            />
          </div>

          {/* Background Color Selection */}
          {/* <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Background Color</label>
            <div className="grid grid-cols-5 gap-4">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-16 rounded-xl border-4 transition-all ${
                    selectedColor === color
                      ? "border-neutral-white scale-110"
                      : "border-transparent hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isCreating || !isConnected}
                  title={color}
                />
              ))}
            </div>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !isConnected || !roomName.trim()}
            className="px-6 py-3 rounded-full bg-secondary text-neutral-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
          >
            {isCreating ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
}

