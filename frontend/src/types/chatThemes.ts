export interface ThemeProps{
    logo: string;
    background: string;
    text: string;
    left: string;
    textLeft: string;
    right: string;
    textRight: string;
    sendButton: string;
    shadow: string;
};

export const chatThemes : Record<string,ThemeProps> = {
    "1" : {
        logo: "/themes/chart1.png",
        background: "bg-white",
        text: "text-black",
        left: "bg-white",
        textLeft: "text-black",
        right: "bg-black",
        textRight: "text-white",
        sendButton: "black",
        shadow: "shadow-[3px_3px_5px_#9ba4b3]"
    },
    "2" : {
        logo: "/themes/chart2.png",
        background: "bg-[#F0C1E1]",
        text: "text-black",
        left: "bg-[#FDDBBB]",
        textLeft: "text-black",
        right: "bg-[#FFF9BF]",
        textRight: "text-black",
        sendButton: "bg-[#CB9DF0]",
        shadow: "shadow-[3px_3px_5px_#cf8fba]"
    },
    "3" : {
        logo: "/themes/chart3.png",
        background: "bg-[#003092]",
        text: "text-white",
        left: "bg-[#FFF2DB]",
        textLeft: "text-black",
        right: "bg-[#FFAB5B]",
        textRight: "text-black",
        sendButton: "bg-[#00879E]",
        shadow: "shadow-[3px_3px_3px_#FFF2DB]"
    },
    "4" : {
        logo: "/themes/chart4.png",
        background: "bg-[#F3F2EC]",
        text: "text-black",
        left: "bg-[#E62727]",
        textLeft: "text-white",
        right: "bg-[#1E93AB]",
        textRight: "text-white",
        sendButton:"bg-[#DCDCDC]",
        shadow: "shadow-[3px_3px_5px_#9ba4b3]"
    }, 
    "5" : {
        logo: "/themes/chart5.png",
        background: "bg-[#8CE4FF]",
        text: "text-black",
        left: "bg-[#FEEE91]",
        textLeft: "text-black",
        right: "bg-[#FFA239]",
        textRight: "text-black",
        sendButton:"bg-[#FF5656]",
        shadow: "shadow-[3px_3px_5px_#5890a1]"
    },
    "6" : {
        logo: "/themes/chart6.png",
        background: "bg-[#FF748B]",
        text: "text-black",
        left: "bg-[#A7D477]",
        textLeft: "text-black",
        right: "bg-[#E4F1AC]",
        textRight: "text-black",
        sendButton:"bg-[#F72C5B]",
        shadow: "shadow-[3px_3px_5px_#c41a41]"
    },
};