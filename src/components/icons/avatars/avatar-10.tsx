import type { SVGProps } from "react";

export default function Avatar10(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .cheese-drip {
                    animation: drip-melt 4s ease-out infinite;
                }
                @keyframes drip-melt {
                    0% { transform: translateY(0); opacity: 1; }
                    80% { transform: translateY(5px); opacity: 1; }
                    100% { transform: translateY(10px); opacity: 0; }
                }
            `}
        </style>
        <path d="M12 16L32 60L52 16H12Z" fill="#FBBF24" stroke="#EA580C" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M12 16C16 12 24 8 32 8C40 8 48 12 52 16" fill="#FCA5A5" stroke="#EA580C" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="4" fill="#DC2626"/>
        <circle cx="40" cy="34" r="3" fill="#DC2626"/>
        <circle cx="32" cy="44" r="5" fill="#DC2626"/>
        <circle cx="38" cy="22" r="2" fill="#FBBF24" className="cheese-drip" style={{ animationDelay: '1s' }}/>
    </svg>
  );
}
