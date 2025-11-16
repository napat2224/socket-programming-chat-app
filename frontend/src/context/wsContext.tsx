"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebase/firebase";

// Shared types - exported for use in pages
export interface OnlineUser {
  userId: string;
  name: string;
  profile: number;
}

export interface WsMessage {
  type: string;
  status?: string;
  data: any;
}

export type MessageHandler = (message: WsMessage) => void;

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;

  // Shared state: Online users (used across multiple pages)
  onlineUsers: OnlineUser[];

  // Send message through WebSocket
  sendMessage: (message: WsMessage) => void;

  // Subscribe to WebSocket messages (pages handle their own message types)
  addMessageHandler: (handler: MessageHandler) => () => void;

  // Manually reconnect WebSocket (useful after registration)
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = useCallback(async () => {
    try {
      // Get Firebase auth token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }

      // Close existing connection if any
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const token = await currentUser.getIdToken();
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const wsUrl = apiUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://");

      // Connect to WebSocket with auth token
      const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        wsRef.current = ws;
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          console.log("Received WebSocket message:", message);

          // SHARED LOGIC: Handle presence (used across all pages)
          if (message.type === "presence_snapshot") {
            const snapshotData =
              typeof message.data === "string"
                ? JSON.parse(message.data)
                : message.data;

            if (snapshotData.users && Array.isArray(snapshotData.users)) {
              setOnlineUsers(snapshotData.users);
            }
          }

          if (message.type === "user_presence") {
            const presenceData =
              typeof message.data === "string"
                ? JSON.parse(message.data)
                : message.data;

            if (message.status === "online") {
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
              setOnlineUsers((prev) =>
                prev.filter((u) => u.userId !== presenceData.userId)
              );
            }
          }

          // Notify all registered message handlers (pages handle their own message types)
          messageHandlersRef.current.forEach((handler) => {
            try {
              handler(message);
            } catch (error) {
              console.error("Error in message handler:", error);
            }
          });
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(`Attempting to reconnect in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  }, []);

  useEffect(() => {
    // Wait for auth state to be ready
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          // Get token and check if user has completed registration (has custom claims)
          const tokenResult = await currentUser.getIdTokenResult();
          const hasName = tokenResult.claims.name;
          const hasProfile = tokenResult.claims.profile;

          // Only connect WebSocket if user has completed registration
          if (hasName && hasProfile) {
            connectWebSocket();
          } else {
            console.log(
              "User hasn't completed registration yet, skipping WebSocket connection"
            );
            // Close existing connection if any
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.close();
            }
            setIsConnected(false);
            setOnlineUsers([]);
          }
        } catch (error) {
          console.error("Error checking user claims:", error);
        }
      } else {
        // User logged out, close WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        setIsConnected(false);
        setOnlineUsers([]);
      }
    });

    return () => {
      unsubscribe();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback((message: WsMessage) => {
    if (!wsRef.current) {
      console.error("WebSocket not initialized");
      throw new Error("WebSocket not initialized");
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      throw new Error("WebSocket not connected");
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      throw error;
    }
  }, []);

  const addMessageHandler = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.add(handler);

    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    onlineUsers,
    sendMessage,
    addMessageHandler,
    reconnect: connectWebSocket,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
