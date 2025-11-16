export interface MessageProps {
    id: string
    roomId: string
    senderId: string
    senderProfile: number
    senderName: string;
    content: string
    replyTo: string | null
    reactions: string[] | null
    createdAt: string
}

export const ReactionType : Record<string, string> = {
    "like":"/reacts/like.png",
    "love":"/reacts/love.png",
    "laugh":"/reacts/laugh.png",
    "sad":"/reacts/sad.png",
    "angry":"/reacts/angry.png",
};