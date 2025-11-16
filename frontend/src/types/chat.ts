export interface MessageProps {
    id: string
    roomId: string
    senderId: string
    senderName: string;
    content: string
    replyTo: string | null
    reactions: string[] | null
    createdAt: string
}

export const ReactionType : Record<string, string> = {
    "like":"",
    "love":"",
    "laugh":"",
    "sad":"",
    "angry":"",
};