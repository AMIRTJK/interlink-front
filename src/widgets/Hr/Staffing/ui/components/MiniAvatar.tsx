import React, { useState } from 'react';

export interface IMiniAvatarProps {
  photo: string;
  initials: string;
  color: string;
  size?: 'xs' | 'sm' | 'md';
}

export const MiniAvatar = ({
  photo,
  initials,
  color,
  size = 'sm',
}: IMiniAvatarProps) => {
  const [err, setErr] = useState(false);
  const cls =
    size === 'xs'
      ? 'w-5 h-5 text-[9px]'
      : size === 'md'
      ? 'w-9 h-9 text-sm'
      : 'w-7 h-7 text-xs';

  if (err || !photo) {
    return (
      <div
        className={`${cls} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={initials}
      onError={() => setErr(true)}
      className={`${cls} rounded-full object-cover shrink-0`}
    />
  );
};
