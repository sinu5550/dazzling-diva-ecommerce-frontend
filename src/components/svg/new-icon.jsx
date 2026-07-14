import React from 'react';

export default function NewIcon({ className = '', ...props }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 4-point sparkle / starburst */}
      <path
        d="M9 1.5L10.2 7.8L16.5 9L10.2 10.2L9 16.5L7.8 10.2L1.5 9L7.8 7.8L9 1.5Z"
        fill="currentColor"
      />
      <circle cx="14" cy="4" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="4.5" cy="13.5" r="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
