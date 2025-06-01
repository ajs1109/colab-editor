import Image from 'next/image';
import React from 'react';

interface UserAvatarProps {
  username: string;
  avatarUrl: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username, avatarUrl, size = 40 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src={avatarUrl}
        alt={`${username}'s avatar`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          marginRight: '8px',
        }}
      />
      <span>{username}</span>
    </div>
  );
};

export default UserAvatar;