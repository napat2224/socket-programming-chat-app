"use client";
import Header from "@/components/chat/header";
import MemberList, { MemberProps } from "@/components/chat/memberList";
import Message from "@/components/chat/message";
import MessageInput from "@/components/chat/messageInput";
import { useWebSocket } from "@/context/wsContext";
import { MessageProps } from "@/types/chat";
import { chatThemes, ThemeProps } from "@/types/chatThemes";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ChatRoomPage() {
    const roomId = useParams();
    const { isConnected, sendMessage, addMessageHandler } = useWebSocket();
    const [theme, setTheme] = useState<ThemeProps>(chatThemes["1"]);
    const messages: MessageProps[] = mockmessage;
    const userId = "HVUHBTjrFqVV89zwziLqrQthFVz2";

    return (
        <div className="flex flex-col w-screen h-screen">
            <Header username="Tungmay" setTheme={setTheme}/>
            <MemberList memberList={mockmemberlist}className={`${theme.sendButton} ${theme.text}`}/>
            <div className={`flex-1 flex flex-col w-full pt-4 gap-1 overflow-y-scroll ${theme.background}`}>
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
                    />
                ))}
            </div>
            <MessageInput 
                connected={true}
                sendMessage={sendMessage}
                roomId={messages[0].roomId}
                theme={theme}
            />
        </div>
    );
}

const mockmemberlist: MemberProps[] = [
    {
        id:"user-1",
        profile: 1,
        name: "John"
    },
    {
        id:"user-2",
        profile: 2,
        name: "Sarah"
    },
    {
        id:"user-3",
        profile: 3,
        name: "Prim"
    },
]

const mockmessage:MessageProps[] = [
    {
        id: "ms-1",
        roomId: "room-1",
        senderId: "user-1",
        senderProfile: 1,
        senderName: "John",
        content: "Hi everyoneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        replyTo: null,
        reactions: ["love", "like", "love", "laugh"],
        createdAt: "2025-11-16 07:00:00"
    },
    {
        id: "ms-2",
        roomId: "room-1",
        senderId: "user-2",
        senderProfile: 3,
        senderName: "Prim",
        content: "สวัสดีทุกคน",
        replyTo: null,
        reactions: ["love", "like", "love", "laugh"],
        createdAt: "2025-11-16 07:01:00"
    },
    {
        id: "ms-3",
        roomId: "room-1",
        senderId: "user-3",
        senderProfile: 2,
        senderName: "Sarah",
        content: "Wa-ngai",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:30"
    },
    {
        id: "ms-1",
        roomId: "room-1",
        senderId: "user-1",
        senderProfile: 1,
        senderName: "John",
        content: "Hi everyoneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:00:00"
    },
    {
        id: "ms-2",
        roomId: "room-1",
        senderId: "user-2",
        senderProfile: 3,
        senderName: "Prim",
        content: "สวัสดีทุกคน",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:00"
    },
    {
        id: "ms-3",
        roomId: "room-1",
        senderId: "user-3",
        senderProfile: 2,
        senderName: "Sarah",
        content: "Wa-ngai",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:30"
    },
    {
        id: "ms-1",
        roomId: "room-1",
        senderId: "user-1",
        senderProfile: 1,
        senderName: "John",
        content: "Hi everyoneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        replyTo: "You นั่นแหลttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt",
        reactions: [],
        createdAt: "2025-11-16 07:00:00"
    },
    {
        id: "ms-2",
        roomId: "room-1",
        senderId: "user-2",
        senderProfile: 1,
        senderName: "Prim",
        content: "สวัสดีทุกคน",
        replyTo: "จ้าาส์",
        reactions: [],
        createdAt: "2025-11-16 07:01:00"
    },
    {
        id: "ms-3",
        roomId: "room-1",
        senderId: "user-3",
        senderProfile: 1,
        senderName: "Sarah",
        content: "Wa-ngai",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:30"
    },
    {
        id: "ms-1",
        roomId: "room-1",
        senderId: "user-1",
        senderProfile: 1,
        senderName: "John",
        content: "Hi everyoneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:00:00"
    },
    {
        id: "ms-2",
        roomId: "room-1",
        senderId: "user-2",
        senderProfile: 1,
        senderName: "Prim",
        content: "สวัสดีทุกคน",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:00"
    },
    {
        id: "ms-3",
        roomId: "room-1",
        senderId: "user-3",
        senderProfile: 1,
        senderName: "Sarah",
        content: "Wa-ngai",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:30"
    },
];