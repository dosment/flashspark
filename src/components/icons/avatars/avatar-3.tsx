import type { SVGProps } from "react";

export default function Avatar3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .cat-ear {
                    animation: cat-ear-twitch 5s ease-in-out infinite;
                }
                .cat-ear.right {
                    animation-delay: 0.2s;
                }
                .cat-eye {
                    animation: cat-eye-wink 4s ease-in-out infinite;
                }
                .cat-eye.right {
                    animation-delay: 0.1s;
                }
                @keyframes cat-ear-twitch {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-5deg); }
                }
                @keyframes cat-eye-wink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
            `}
        </style>
        <rect width="64" height="64" rx="32" fill="#FED7AA"/>
        <path d="M22 24C22 20 24 16 28 16H29" stroke="#C2410C" strokeWidth="4" strokeLinecap="round" className="cat-ear left"/>
        <path d="M42 24C42 20 40 16 36 16H35" stroke="#C2410C" strokeWidth="4" strokeLinecap="round" className="cat-ear right"/>
        <rect x="22" y="30" width="4" height="10" rx="2" fill="#C2410C" className="cat-eye left"/>
        <rect x="38" y="30" width="4" height="10" rx="2" fill="#C2410C" className="cat-eye right"/>
        <path d="M28 46C28 48.2091 29.7909 50 32 50C34.2091 50 36 48.2091 36 46" stroke="#C2410C" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 40V46" stroke="#C2410C" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
