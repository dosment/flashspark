
import type { SVGProps } from "react";

export default function Avatar2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .eye-block {
                    animation: eye-wink 4s ease-in-out infinite;
                }
                .eye-block:first-of-type {
                    animation-delay: 0.2s;
                }
                @keyframes eye-wink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
            `}
        </style>
        <rect width="64" height="64" rx="32" fill="#A7F3D0"/>
        <path d="M22 42C24.6667 46 29.3333 46 32 42" stroke="#065F46" strokeWidth="4" strokeLinecap="round"/>
        <rect x="20" y="24" width="8" height="8" rx="2" fill="#065F46" className="eye-block"/>
        <rect x="36" y="24" width="8" height="8" rx="2" fill="#065F46" className="eye-block"/>
    </svg>
  );
}
