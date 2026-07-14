import React from 'react';

export default function OfferIcon({ className = '', ...props }) {
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
      <path
        d="M15.75 8.46967L9.53033 2.25H3.75C2.92157 2.25 2.25 2.92157 2.25 3.75V9.53033L8.46967 15.75C9.06057 16.3409 10.0104 16.3409 10.6013 15.75L15.75 10.6013C16.3409 10.0104 16.3409 9.06057 15.75 8.46967Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="6"
        r="0.9"
        fill="currentColor"
      />
    </svg>
  );
}
