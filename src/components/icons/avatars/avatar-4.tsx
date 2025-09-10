import type { SVGProps } from "react";

export default function Avatar4(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .robot-antenna {
                    animation: robot-antenna-wobble 4s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                .robot-eye-light {
                    animation: robot-eye-blink 2s steps(1, start) infinite;
                }
                @keyframes robot-antenna-wobble {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    75% { transform: rotate(-10deg); }
                }
                @keyframes robot-eye-blink {
                    0%, 100% { fill: #F87171; }
                    50% { fill: #DC2626; }
                }
            `}
        </style>
        <rect x="14" y="20" width="36" height="28" rx="8" fill="#D1D5DB" stroke="#4B5563" strokeWidth="4"/>
        <rect x="22" y="30" width="20" height="8" rx="2" fill="#9CA3AF" stroke="#4B5563" strokeWidth="4"/>
        <path d="M32 20V14" stroke="#4B5563" strokeWidth="4" strokeLinecap="round" className="robot-antenna"/>
        <circle cx="32" cy="12" r="3" fill="#F87171" stroke="#4B5563" strokeWidth="2" className="robot-eye-light"/>
        <circle cx="24" cy="28" r="2" fill="#4B5563"/>
        <circle cx="40" cy="28" r="2" fill="#4B5563"/>
    </svg>
  );
}
