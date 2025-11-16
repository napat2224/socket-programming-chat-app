"use client";

import { useWebSocket } from "@/context/wsContext";
import { ThemeProps } from "@/types/chatThemes";
import { useState } from "react";

interface Props {
    connected: boolean;
    roomId: string;
    theme: ThemeProps;
    isReply: string;
    setIsReply: (data : any) => void;
}

export default function MessagsInput ({
  connected,
  roomId,
  theme,
  isReply,
  setIsReply
}: Props) {
    const [text, setText] = useState("");
    const { sendMessage } = useWebSocket();

    // Handle sending a message
    const handleSendMessage = () => {
        if (!text.trim()) return;
        sendMessage({
            type: "message",
            data: {
                content: text,
                roomId: roomId,
                replyContent: isReply,
            }
        });
        setText("");
        if(isReply!=="") setIsReply("")
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col">
            {isReply!=="" &&
            <div className="w-full bg-gray-200 px-5 py-2">
                reply: {isReply}
            </div>}
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
        </div>
    );
}