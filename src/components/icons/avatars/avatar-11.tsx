import type { SVGProps } from "react";

export default function Avatar11(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .eye-wink {
                    animation: wink-animation 3s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes wink-animation {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
            `}
        </style>
        <rect width="64" height="64" rx="32" fill="#A7F3D0"/>
        <path d="M20 44C20 37.3726 25.3726 32 32 32C38.6274 32 44 37.3726 44 44" stroke="#047857" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="4" fill="#047857"/>
        <path d="M36 28C36 26 38 24 40 24C42 24 44 26 44 28" stroke="#047857" strokeWidth="4" strokeLinecap="round" className="eye-wink"/>
    </svg>
  );
}
