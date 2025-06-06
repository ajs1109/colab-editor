"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CustomAvatar from "../ui/custom-avatar";

export interface AvatarType {
  imageUrl: string;
  name: string; // Optional name for display purposes
}

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: AvatarType[];
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => {
        return (
        <a
          title={url.name}
          key={index}
          href={`/${url.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CustomAvatar url={url} />
        </a>
      )
      })}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href=""
        >
          +{numPeople}
        </a>
      )}
    </div>
  );
};
