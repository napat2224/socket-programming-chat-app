"use client";
import Header from "@/components/chat/header";
import Message from "@/components/chat/message";
import MessageInput from "@/components/chat/messageInput";
import { MessageProps } from "@/types/chat";
import { chatThemes, ThemeProps } from "@/types/chatThemes";
import { useState } from "react";

export default function ChatGroupPage({
    roomId,
}: { roomId : string }) {
    const [theme, setTheme] = useState<ThemeProps>(chatThemes["1"]);
    const messages: MessageProps[] = mockmessage;
    const userId = "user-2";
    const sendMessage = () => {};

    return (
        <div className="flex flex-col w-screen h-screen">
            <Header username="Tungmay" setTheme={setTheme}/>
            <div className={`flex-1 flex flex-col w-full pt-4 gap-0.5 overflow-y-scroll ${theme.background}`}>
                {messages.map((m, index) => (
                    <Message
                        key={index}
                        id={m.id}
                        roomId={m.roomId}
                        senderId={m.senderId}
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
                // sendMessage={sendMessage}
                roomId={messages[0].roomId}
                theme={theme}
            />
        </div>
    );
}

const mockmessage:MessageProps[] = [
    {
        id: "ms-1",
        roomId: "room-1",
        senderId: "user-1",
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
        senderName: "John",
        content: "Hi everyoneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        replyTo: "You นั่นแหละ",
        reactions: [],
        createdAt: "2025-11-16 07:00:00"
    },
    {
        id: "ms-2",
        roomId: "room-1",
        senderId: "user-2",
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
        senderName: "Sarah",
        content: "Wa-ngai",
        replyTo: null,
        reactions: [],
        createdAt: "2025-11-16 07:01:30"
    },
];