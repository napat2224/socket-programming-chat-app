"use client";

import { MessageProps, ReactionType } from "@/types/chat";
import { ThemeProps } from "@/types/chatThemes";
import { CornerUpRight, SmilePlus } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { avatars } from "@/types/avatar";
import { MessageHandler, WsMessage } from "@/context/wsContext";

export default function Message ({
    id,
    roomId,
    senderId,
    senderProfile,
    senderName,
    content,
    replyTo,
    reactions,
    createdAt,
    theme,
    userId,
    sendMessage,
    addMessageHandler
}: MessageProps & { 
    theme:ThemeProps, 
    userId: string,
    sendMessage: (data:{
        type: string,
        data: {
            messageId: string,
            reactType: string,
        }
    }) => void
    addMessageHandler: (handler: MessageHandler) => () => void,
}) {   
    const [currReactions, setCurrReactions] = useState<string[]>(reactions? reactions:[]);
    const [isReact, setIsReact] = useState<boolean>(false);
    const isMine = senderId === userId;
    const time = new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    useEffect(() => {
        const removeHandler = addMessageHandler((msg: WsMessage) => {
            if (msg.type === "react_message") {
                console.log("New react message:", msg.data);

                if(msg.data.messageId === id)
                    setCurrReactions((prev) => [...prev, msg.data.reactType])
            }
        });

        return () => { removeHandler(); };
    }, [addMessageHandler]);

    return (
        <div className={`w-full flex flex-col ${isMine? "items-end":"items-start"} gap-1 px-3 ${theme.text}`}>
            <div className="flex items-center gap-3 my-2">
                <Image
                    src={avatars[senderProfile]}
                    alt={senderName}
                    width={40}
                    height={40}
                    className={`rounded-full ${isMine? "order-2":""}`}
                />
                <span className={`text-lg font-semibold ${isMine? "order-1":""}`}>
                    {senderName}
                </span>
            </div>
            {replyTo && 
            <div className={`w-full flex items-start gap-1 p-2 
                    ${isMine? "justify-end":"justify-start"}`}>
                <CornerUpRight width={20} height={20} strokeWidth={1.5} />
                <div className={`max-w-[40%] px-3 py-1 bg-gray-200 text-black
                    rounded-2xl ${theme.shadow} text-xs wrap-break-word whitespace-pre-wrap
                `}>
                    {replyTo}
                </div>
            </div>}

            <div className={`max-w-full shrink flex gap-2 ${isMine? "justify-end":"justify-start"} group`}>
                <div className={`relative max-w-[80%] shrink h-full px-4 py-2 rounded-2xl 
                    ${theme.shadow} text-base wrap-break-word whitespace-pre-wrap
                    ${isMine? `order-2 ${theme.right} ${theme.textRight}`:`${theme.left} ${theme.textLeft}`}`}>
                    {content}

                    {isReact && 
                    <div className={`absolute -bottom-10 flex gap-2 rounded-lg z-9999  bg-transparent
                                    ${isMine ? "right-10" : "left-10"}`}>
                        {Object.entries(ReactionType).map(([name, src], index) => (
                            <div 
                                key={index} 
                                className="w-12 h-12 rounded-full relative overflow-hidden hover:scale-110"
                                onClick={() => {
                                    sendMessage({
                                        type: "react_message",
                                        data: {
                                            messageId: id,
                                            reactType: name,
                                        }
                                    });
                                    setIsReact(false)
                                }}>
                                <Image
                                    src={src} 
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>}
                </div>
                <div className={`self-end text-xs ${theme.text} ${isMine? "order-1 items-end" : "items-start"}`}> 
                    <span className="group-hover:hidden">{time}</span>
                    <span className="hidden group-hover:inline-block">
                        <SmilePlus width={20} height={20} strokeWidth={1.5} onClick={() => setIsReact(!isReact)}/>
                    </span>
                </div>
            </div>

            {currReactions && currReactions.length > 0 &&
            <div className={`flex px-2 py-1 items-center rounded-full bg-white ${isMine ? "justify-end" : "justify-start"}`}>
                {currReactions.slice(0,8).map((r, index) => (
                    <Image
                        key={index}
                        src={ReactionType[r]}
                        alt={r}
                        width={24}
                        height={24}
                    />
                ))}
                {currReactions.length > 8 && "... "}
            </div>}
        </div>
    );
}