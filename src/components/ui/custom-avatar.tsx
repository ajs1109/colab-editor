import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { type AvatarType } from "../magicui/avatar-circles";

const CustomAvatar = ({url}: {url: AvatarType}) => {
  let initials = url.name
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
  if (initials.length > 2) {
    initials = initials.slice(0, 2);
  }
  return (
    <Avatar>
      <AvatarImage src={url.imageUrl} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
