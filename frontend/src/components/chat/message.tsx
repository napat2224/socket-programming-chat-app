import { MessageProps } from "@/types/chat";
import { ThemeProps } from "@/types/chatThemes";

export default function Message ({
    id,
    roomId,
    senderId,
    senderName,
    content,
    replyTo,
    reactions,
    createdAt,
    theme,
    userId
}: MessageProps & { theme:ThemeProps, userId: string })
{   
    const isMine = senderId === userId;
    const time = new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <div className={`w-full flex flex-col ${isMine? "items-end":"items-start"} gap-1 px-3 ${theme.text}`}>
            <span className={`text-lg  font-semibold`}>
                {senderName}
            </span>
            <div className={`max-w-full shrink flex gap-2 ${isMine? "justify-end":"justify-start"}`}>
                <div className={`relative max-w-[80%] shrink h-full px-4 py-2 rounded-3xl 
                    border-2 border-black
                    text-base wrap-break-word whitespace-pre-wrap
                    ${isMine? `order-2 ${theme.right} ${theme.textRight}`:`${theme.left} ${theme.textLeft}`}`}>
                    {content}
                </div>
                <div className={`self-end text-xs ${theme.text} ${isMine? "order-1 items-end" : "items-start"}`}>
                    {time}
                </div>
            </div>
        </div>
    );
}