import type { SVGProps } from "react";

export default function Avatar8(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .ghost-body {
                    animation: ghost-float 3s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes ghost-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}
        </style>
        <g className="ghost-body">
            <path d="M16 32C16 22.0589 23.0589 14 32 14C40.9411 14 48 22.0589 48 32V48H44L40 44L36 48L32 44L28 48L24 44L20 48H16V32Z" fill="#E5E7EB" stroke="#4B5563" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="26" cy="30" r="3" fill="#4B5563"/>
            <circle cx="38" cy="30" r="3" fill="#4B5563"/>
            <path d="M28 38C28 38 30 42 32 42C34 42 36 38 36 38" stroke="#4B5563" strokeWidth="4" strokeLinecap="round"/>
        </g>
    </svg>
  );
}
