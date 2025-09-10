import type { SVGProps } from "react";

export default function Avatar2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .star-main {
                    animation: star-spin 10s linear infinite;
                    transform-origin: center;
                }
                .star-sparkle {
                    animation: star-sparkle-anim 2s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes star-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes star-sparkle-anim {
                    0%, 100% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1); opacity: 1; }
                    80% { transform: scale(0.8); opacity: 0.5; }
                }
            `}
        </style>
        <path className="star-main" d="M32 4L37.1357 20.3255L54.4338 22.1357L40.7169 32.8643L45.8643 49L32 40.3255L18.1357 49L23.2831 32.8643L9.56623 22.1357L26.8643 20.3255L32 4Z" fill="#FEF08A" stroke="#EAB308" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M32 26C33.3333 28.3333 36 29 36 29C36 29 33.3333 29.6667 32 31C30.6667 29.6667 28 29 28 29C28 29 30.6667 28.3333 32 26Z" fill="#FDE68A"/>
        <circle cx="24" cy="24" r="2" fill="#FACC15" className="star-sparkle" style={{ animationDelay: '0.5s' }}/>
        <circle cx="40" cy="24" r="2" fill="#FACC15" className="star-sparkle" style={{ animationDelay: '1s' }}/>
        <circle cx="44" cy="40" r="2" fill="#FACC15" className="star-sparkle" style={{ animationDelay: '1.5s' }}/>
    </svg>
  );
}
