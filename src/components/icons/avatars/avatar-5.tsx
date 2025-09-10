import type { SVGProps } from "react";

export default function Avatar5(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .book-pages {
                    animation: book-flutter 3s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                @keyframes book-flutter {
                    0%, 100% { transform: scaleY(1) rotateX(0deg); }
                    50% { transform: scaleY(0.95) rotateX(10deg); }
                }
            `}
        </style>
        <g className="book-pages">
            <path d="M12 52C12 52 16 48 32 48C48 48 52 52 52 52V16C52 13.7909 50.2091 12 48 12H16C13.7909 12 12 13.7909 12 16V52Z" fill="#BFDBFE" stroke="#2563EB" strokeWidth="4"/>
            <path d="M32 12V48" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
            <path d="M22 18H18" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
            <path d="M22 26H18" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
        </g>
    </svg>
  );
}
