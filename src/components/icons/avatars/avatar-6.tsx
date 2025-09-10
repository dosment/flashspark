import type { SVGProps } from "react";

export default function Avatar6(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .lightbulb-glow {
                    animation: lightbulb-pulse 2s ease-in-out infinite;
                }
                @keyframes lightbulb-pulse {
                    0%, 100% { fill: #FEF9C3; }
                    50% { fill: #FEF08A; }
                }
            `}
        </style>
        <path d="M32 38C39.732 38 46 31.732 46 24C46 16.268 39.732 10 32 10C24.268 10 18 16.268 18 24C18 31.732 24.268 38 32 38Z" fill="#FEF9C3" stroke="#A16207" strokeWidth="4" className="lightbulb-glow"/>
        <path d="M26 38V42C26 43.1046 26.8954 44 28 44H36C37.1046 44 38 43.1046 38 42V38" stroke="#A16207" strokeWidth="4" strokeLinecap="round"/>
        <path d="M28 48H36" stroke="#A16207" strokeWidth="4" strokeLinecap="round"/>
        <path d="M30 52H34" stroke="#A16207" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
