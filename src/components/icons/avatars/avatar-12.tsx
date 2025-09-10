import type { SVGProps } from "react";

export default function Avatar12(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .mouth-ooh {
                    animation: ooh-animation 2.5s ease-in-out infinite;
                }
                @keyframes ooh-animation {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}
        </style>
        <rect width="64" height="64" rx="32" fill="#C4B5FD"/>
        <path d="M22 28L30 28" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round"/>
        <path d="M34 28L42 28" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="42" r="6" stroke="#5B21B6" strokeWidth="4" className="mouth-ooh"/>
    </svg>
  );
}
