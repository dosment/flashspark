import type { SVGProps } from "react";

export default function Avatar7(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .planet-ring {
                    animation: planet-orbit 8s linear infinite;
                    transform-origin: center;
                }
                .planet-body {
                    animation: planet-wobble 6s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes planet-orbit {
                    from { transform: rotateY(0deg) rotateZ(-15deg); }
                    to { transform: rotateY(360deg) rotateZ(-15deg); }
                }
                @keyframes planet-wobble {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(5deg); }
                }
            `}
        </style>
        <circle cx="32" cy="32" r="16" fill="#FCA5A5" stroke="#B91C1C" strokeWidth="4" className="planet-body"/>
        <ellipse cx="32" cy="32" rx="26" ry="8" stroke="#FDBA74" strokeWidth="4" className="planet-ring"/>
    </svg>
  );
}
