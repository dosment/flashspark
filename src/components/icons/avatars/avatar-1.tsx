import type { SVGProps } from "react";

export default function Avatar1(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .rocket-body {
                    animation: rocket-bob 3s ease-in-out infinite;
                    transform-origin: center bottom;
                }
                .rocket-flame {
                    animation: flame-flicker 0.5s ease-in-out infinite alternate;
                    transform-origin: center bottom;
                }
                @keyframes rocket-bob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes flame-flicker {
                    0% { transform: scaleY(1) translateY(0); }
                    100% { transform: scaleY(1.2) translateY(2px); }
                }
            `}
        </style>
        <g className="rocket-body">
            <path d="M43 44C43 47.7711 43 49.6567 41.8284 50.8284C40.6569 52 38.7712 52 35 52H29C25.2288 52 23.3431 52 22.1716 50.8284C21 49.6567 21 47.7712 21 44V24C21 19.324 21 17.0001 22.3499 15.8044C23.6999 14.6088 26.0487 14.1539 30.7464 13.2442L32 13L33.2536 13.2442C37.9513 14.1539 40.3001 14.6088 41.6501 15.8044C43 17.0001 43 19.324 43 24V44Z" fill="#E0E7FF"/>
            <path d="M43 44C43 47.7711 43 49.6567 41.8284 50.8284C40.6569 52 38.7712 52 35 52H29C25.2288 52 23.3431 52 22.1716 50.8284C21 49.6567 21 47.7712 21 44V24C21 19.324 21 17.0001 22.3499 15.8044C23.6999 14.6088 26.0487 14.1539 30.7464 13.2442L32 13L33.2536 13.2442C37.9513 14.1539 40.3001 14.6088 41.6501 15.8044C43 17.0001 43 19.324 43 24V44Z" stroke="#3730A3" strokeWidth="4"/>
            <path d="M32 13L35.4641 7H28.5359L32 13Z" fill="#FECACA" stroke="#991B1B" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="32" cy="30" r="5" fill="#BFDBFE" stroke="#3730A3" strokeWidth="4"/>
        </g>
        <path d="M24 52L21 60L27 56L24 52Z" fill="#FBBF24" className="rocket-flame" />
        <path d="M32 52L32 61L35 57L32 52Z" fill="#FBBF24" className="rocket-flame" style={{ animationDelay: '0.2s' }}/>
        <path d="M40 52L43 60L37 56L40 52Z" fill="#FBBF24" className="rocket-flame" style={{ animationDelay: '0.1s' }}/>
    </svg>
  );
}
