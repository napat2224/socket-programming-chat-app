"use client";

import Header from "@/components/chat/header";
import MemberList, { MemberProps } from "@/components/chat/memberList";
import Message from "@/components/chat/message";
import MessageInput from "@/components/chat/messageInput";
import { useWebSocket, WsMessage } from "@/context/wsContext";
import { MessageProps } from "@/types/chat";
import { chatThemes, ThemeProps } from "@/types/chatThemes";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api/api-client";

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const { isConnected, sendMessage, addMessageHandler } = useWebSocket();

  const [theme, setTheme] = useState<ThemeProps>(chatThemes["1"]);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [members, setMembers] = useState<MemberProps[]>([]);
  const [roomName, setRoomName] = useState<string | null>(null);
  const userId = "HVUHBTjrFqVV89zwziLqrQthFVz2";

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const fetchRoom = async () => {
      try {
        const res = await api.get(`/api/rooms/${roomId}`);
        const room = res.data.data as {
          roomId: string;
          roomName: string | null;
          members: { id: string; name: string; profile: number }[];
        };

        if (cancelled) return;

        setRoomName(room.roomName ?? null);
        setMembers(
          room.members.map((m) => ({
            id: m.id,
            name: m.name,
            profile: m.profile,
          }))
        );
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };

    fetchRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    const removeHandler = addMessageHandler((msg: WsMessage) => {
      if (msg.type !== "join_room") {
        return;
      }
      const raw = msg.data as any;

      const data = {
        roomId: raw.room_id ?? raw.roomId,
        userId: raw.user_id ?? raw.userId,
        name: raw.name,
        profile: raw.profile,
      };
      if (!data.roomId || data.roomId !== roomId) {
        return;
      }

      setMembers((prev) => {
        const exists = prev.some((m) => m.id === data.userId);
        if (exists) {
          return prev;
        }

        const next = [
          ...prev,
          {
            id: data.userId,
            name: data.name,
            profile: data.profile,
          },
        ];
        return next;
      });
    });

    return () => {
      removeHandler();
    };
  }, [addMessageHandler, roomId]);

  useEffect(() => {
    if (!roomId) return;
    if (!isConnected) return;

    sendMessage({
      type: "join_room",
      data: { roomId },
    });
  }, [roomId, isConnected, sendMessage]);

  useEffect(() => {
    const removeHandler = addMessageHandler((msg: WsMessage) => {
      if (msg.type === "message") {
        console.log("New chat message:", msg.data);
        setMessages((prev) => [...prev, msg.data]);
      }
    });

    return () => {
      removeHandler();
    };
  }, [addMessageHandler]);

  return (
    <div className="flex flex-col w-screen h-screen">
      <Header username={roomName || "Chat"} setTheme={setTheme} />

      <MemberList
        memberList={members}
        className={`${theme.sendButton} ${theme.text}`}
      />

      <div
        className={`flex-1 flex flex-col w-full pt-4 gap-1 overflow-y-scroll ${theme.background}`}
      >
        {messages.map((m, index) => (
          <Message
            key={index}
            id={m.id}
            roomId={m.roomId}
            senderId={m.senderId}
            senderProfile={m.senderProfile}
            senderName={m.senderName}
            content={m.content}
            replyTo={m.replyTo}
            reactions={m.reactions}
            createdAt={m.createdAt}
            theme={theme}
            userId={userId}
            sendMessage={sendMessage}
            addMessageHandler={addMessageHandler}
          />
        ))}
      </div>

      <MessageInput
        connected={isConnected}
        sendMessage={sendMessage}
        roomId={roomId}
        theme={theme}
      />
    </div>
  );
}
