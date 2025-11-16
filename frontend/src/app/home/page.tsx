"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useWebSocket, WsMessage } from "@/context/wsContext";

interface Room {
  roomId: string;
  createdBy: string;
  chatName: string;
  userId: string[];
  background: string;
  isJoined: boolean;
}

export default function Home() {
  const { name: currentUserName } = useAuth();
  const { isConnected, onlineUsers, sendMessage, addMessageHandler } =
    useWebSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  const fetchPublicRooms = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

      const res = await fetch(`${apiUrl}/api/rooms/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.data) {
        setRooms(
          json.data.map((room: any) => ({
            roomId: room.id,
            createdBy: room.creatorId,
            chatName: room.roomName,
            userId: Array(room.memberNumber).fill("member"),
            background: room.backgroundColor,
            isJoined: room.isJoined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load public rooms:", err);
    }
  }, []);

  useEffect(() => {
    // PAGE-SPECIFIC: Handle join_room messages
    const handleMessage = (message: WsMessage) => {
      if (message.type === "join_room") {
        const joinData =
          typeof message.data === "string"
            ? JSON.parse(message.data)
            : message.data;
        router.push(`/chat/${joinData.roomId}`);
      }
    };

    // Subscribe to WebSocket messages
    const unsubscribe = addMessageHandler(handleMessage);

    // Load public rooms when WebSocket connects
    if (isConnected) {
      fetchPublicRooms();
    }

    return unsubscribe;
  }, [isConnected, addMessageHandler, fetchPublicRooms, router]);

  return (
    <div className="w-full min-h-screen bg-primary p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat Rooms</h1>
        <div className="flex items-center gap-4">
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
      </div>

      {/* Online Users */}
      <h2 className="text-lg font-semibold">
        Online user ({onlineUsers.length})
      </h2>
      <div className="flex items-center gap-4 flex-wrap">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <div
              key={user.userId}
              className="w-16 h-16 bg-neutral-white rounded-full shadow-md flex items-center justify-center text-xs text-neutral-black"
              title={user.name}
            >
              {user.name}
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-black">No users online</p>
        )}
      </div>

      {/* Public Chat */}
      <div className="text-lg font-semibold mt-4">Public chat</div>
      <button
        className="px-6 py-2 rounded-full bg-secondary text-neutral-white mb-4"
        onClick={() => {
          router.push("/home/create-room");
        }}
      >
        Create New Room
      </button>
      <div className="flex flex-col gap-4">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room.roomId}
              className="w-full p-4 rounded-xl flex justify-between items-center shadow bg-neutral-white text-neutral-black"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">{room.chatName}</span>
                <span className="text-sm text-gray-500">
                  Members: {room.userId.length}
                </span>
              </div>
              <button
                className={`px-6 py-2 rounded-full text-neutral-white transition-all ${
                  room.isJoined
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-secondary hover:bg-red-300"
                }`}
                onClick={() => {
                  // PAGE-SPECIFIC: Already joined → go to chat directly (NO websocket)
                  if (room.isJoined) {
                    router.push(`/chat/${room.roomId}`);
                    return;
                  }

                  // PAGE-SPECIFIC: Not joined → send join websocket message
                  try {
                    sendMessage({
                      type: "join_room",
                      data: { roomId: room.roomId },
                    });
                  } catch (error) {
                    console.error("Error sending join room message:", error);
                    alert("Failed to join room. Please try again.");
                  }
                }}
              >
                {room.isJoined ? "Enter Chat" : "Join"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-black">
            No rooms available. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
