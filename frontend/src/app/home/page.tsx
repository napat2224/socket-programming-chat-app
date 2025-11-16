"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface OnlineUser {
  userId: string;
  name: string;
  profile: number;
}

interface Room {
  roomId: string;
  createdBy: string;
  chatName: string;
  userId: string[];
  background: string;
  isJoined: boolean;
}

interface WsMessage {
  type: string;
  status?: string;
  data: any;
}

export default function Home() {
  const { name: currentUserName } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const router = useRouter();

  const fetchPublicRooms = async () => {
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
            userId: Array(room.memberNumber).fill("member"), // or leave it empty and fetch member list later
            background: room.backgroundColor,
            isJoined: room.isJoined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load public rooms:", err);
    }
  };

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Get Firebase auth token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("User not authenticated");
          return;
        }

        const token = await currentUser.getIdToken();
        const apiUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
        const wsUrl = apiUrl
          .replace("http://", "ws://")
          .replace("https://", "wss://");

        // Connect to WebSocket with auth token (backend expects /ws endpoint)
        const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          wsRef.current = ws;

          // Load all public rooms from backend
          fetchPublicRooms();
        };

        ws.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            console.log("Received message:", message);

            // Handle presence snapshot (initial list of online users)
            if (message.type === "presence_snapshot") {
              const snapshotData =
                typeof message.data === "string"
                  ? JSON.parse(message.data)
                  : message.data;

              if (snapshotData.users && Array.isArray(snapshotData.users)) {
                setOnlineUsers(snapshotData.users);
              }
            }

            // Handle user presence updates (user going online/offline)
            if (message.type === "user_presence") {
              const presenceData =
                typeof message.data === "string"
                  ? JSON.parse(message.data)
                  : message.data;

              if (message.status === "online") {
                // Add or update user in the list
                setOnlineUsers((prev) => {
                  const exists = prev.find(
                    (u) => u.userId === presenceData.userId
                  );
                  if (exists) {
                    return prev.map((u) =>
                      u.userId === presenceData.userId
                        ? {
                            userId: presenceData.userId,
                            name: presenceData.name,
                            profile: presenceData.profile,
                          }
                        : u
                    );
                  }
                  return [
                    ...prev,
                    {
                      userId: presenceData.userId,
                      name: presenceData.name,
                      profile: presenceData.profile,
                    },
                  ];
                });
              } else if (message.status === "offline") {
                // Remove user from the list
                setOnlineUsers((prev) =>
                  prev.filter((u) => u.userId !== presenceData.userId)
                );
              }
            }

            if (message.type === "join_room") {
              const joinData =
                typeof message.data === "string"
                  ? JSON.parse(message.data)
                  : message.data;

              setRooms((prev) =>
                prev.map((r) =>
                  r.roomId === joinData.roomId ? { ...r, isJoined: true } : r
                )
              );
              router.push(`/chat/${joinData.roomId}`);
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

    // Wait for auth state to be ready
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        connectWebSocket();
      }
    });

    return () => {
      unsubscribe();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

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
              {room.isJoined && (
                <span className="text-green-600 text-xs mt-1 font-semibold">
                  ✔ Joined
                </span>
              )}
              <button
                className={`px-6 py-2 rounded-full text-neutral-white transition-all ${
                  room.isJoined
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-secondary hover:bg-opacity-90"
                }`}
                onClick={() => {
                  // Already joined → go to chat directly (NO websocket)
                  if (room.isJoined) {
                    router.push(`/chat/${room.roomId}`);
                    return;
                  }

                  // Not joined → send join websocket
                  if (!wsRef.current) return;
                  if (wsRef.current.readyState !== WebSocket.OPEN) {
                    alert("WebSocket not connected. Please wait...");
                    return;
                  }

                  try {
                    wsRef.current.send(
                      JSON.stringify({
                        type: "join_room",
                        data: { roomId: room.roomId },
                      })
                    );
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
