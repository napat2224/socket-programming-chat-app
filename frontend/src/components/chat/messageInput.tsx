"use client";

import { ThemeProps } from "@/types/chatThemes";
import { useState } from "react";

interface Props {
    connected: boolean;
    sendMessage: (data: {
        type: string;
        status?: string;
        data: {
            content: string;
            roomId: string;
            replyContent?: string;
        }
    }) => void;
    roomId: string;
    theme: ThemeProps;
}

export default function MessagsInput ({
  connected,
  sendMessage,
  roomId,
  theme
}: Props) {
    const [text, setText] = useState("");

    // Handle sending a message
    const handleSendMessage = () => {
        if (!text.trim()) return;
        sendMessage({
            type: "message",
            data: {
                content: text,
                roomId: roomId,
            }
        });
        setText("");
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`flex w-full p-3 items-center gap-2 border-t-2 border-black ${theme.sendButton}`}>
            <input
                type="text"
                placeholder={connected? "type your message...":"Connecting..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!connected}
                className="flex-1 rounded-2xl px-3 py-2 border-2 border-black focus:ring-2 bg-white"
            />
            <button 
                onClick={handleSendMessage}
                disabled={!connected}
                className={`px-4 py-2 rounded-2xl text-black border-2 border-black bg-white ${
                    connected ? `hover:shadow-inner hover:shadow-gray-500` : "bg-gray-400"
                    }`}>
                Send
            </button>
        </div>
    );
}