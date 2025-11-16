"use client";

import { chatThemes, ThemeProps } from "@/types/chatThemes";
import { ChevronLeft, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Header({
    username,
    setTheme,
}:{
    username: string;
    setTheme: (theme: ThemeProps) => void;
})
{
    const router = useRouter();
    const [onSetting, setOnSetting] = useState<boolean>(false);
    const [flip, setFlip] = useState(false);

    return (
        <div className="relative border-b-2 border-black">
            <header className="relative flex h-16 px-4 bg-white items-center">
                <button 
                    className="absolute left-4 cursor-pointer hover:scale-110"
                    onClick={() => router.back()}
                >
                    <ChevronLeft width={36} height={36} strokeWidth={1.5} />
                </button>
                
                <span className="mx-auto text-2xl text-center font-bold">{username}</span>

                <button 
                    className="absolute right-4 mr-4 cursor-pointer hover:scale-110"
                    onClick={() => {setOnSetting(!onSetting);setFlip(!flip)}}
                >
                    <Settings2 
                        className={`transition-transform duration-300 ${
                            flip ? "scale-x-[-1]" : "scale-x-100"
                        }`}
                        width={32} 
                        height={32} 
                        strokeWidth={1.5} 
                    />
                </button>
            </header>
            {onSetting && 
                <div className="absolute z-10 top-16 right-4 flex flex-col p-4 bg-white rounded-3xl border-2 border-black">
                    <span className="text-base mb-2">Choose your chat background theme :</span>
                    <div className="flex p-2 gap-2">
                        {Object.values(chatThemes).map((theme, index) => (
                        <button 
                            key={index}
                            className="w-12 h-12 rounded-full bg-white relative overflow-hidden hover:scale-95 border border-gray-200"
                            onClick={() => setTheme(chatThemes[index+1])}
                        >
                            <Image
                                src={theme?.logo ?? ""}
                                alt={"theme"+index}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}</div>
                </div>
            }
        </div>
    );
}