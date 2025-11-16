"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket, WsMessage } from "@/context/wsContext";
import { useAuth } from "@/context/authContext";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  const { isConnected, sendMessage, addMessageHandler } = useWebSocket();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleMessage = (message: WsMessage) => {
      if (message.type === "create_room") {
        const roomData =
          typeof message.data === "string"
            ? JSON.parse(message.data)
            : message.data;
        console.log("Room created:", roomData);
        setIsCreating(false);
        router.push("/"); // navigate after successful creation
      }
    };

    const unsubscribe = addMessageHandler(handleMessage);
    return unsubscribe;
  }, [addMessageHandler, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    if (!isConnected) {
      alert("WebSocket not connected. Please wait...");
      return;
    }

    setIsCreating(true);

    const createRoomData = {
      id: "1234", // optional, backend can generate
      chatName: roomName.trim(),
      background: selectedColor,
    };

    const createRoomMessage = {
      type: "create_room",
      data: createRoomData,
    };

    try {
      sendMessage(createRoomMessage); // ✅ use context
    } catch (error) {
      console.error("Error sending create room message:", error);
      alert("Failed to create room. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-primary p-6 flex flex-col gap-6 mt-15">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
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
