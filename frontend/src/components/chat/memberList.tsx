"use client";

import Image from "next/image";
import { avatars } from "@/types/avatar";

export interface MemberProps {
  id: string;
  profile: number;
  name: string;
}

interface MemberListProps {
  memberList: MemberProps[];
  className?: string;
}

export default function MemberList({ memberList, className }: MemberListProps) {
  return (
    <div
      className={`w-full flex overflow-x-scroll scroll-m-0 p-2 gap-4 ${className}`}
    >
      {memberList.map((m) => (
        <div key={m.id} className="flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full overflow-hidden relative">
            <Image
              src={avatars[m.profile]}
              alt={m.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs mt-1 font-semibold">{m.name}</span>
        </div>
      ))}
    </div>
  );
}
