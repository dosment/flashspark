import type { SVGProps } from "react";

export default function Avatar9(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .controller-button {
                    animation: button-press 1.5s ease-in-out infinite;
                }
                .controller-button.a { animation-delay: 0.2s; }
                .controller-button.b { animation-delay: 0.4s; }
                .controller-button.c { animation-delay: 0.6s; }
                .controller-button.d { animation-delay: 0.8s; }
                @keyframes button-press {
                    0%, 100%, 50% { transform: translateY(0); }
                    25% { transform: translateY(1px); }
                }
            `}
        </style>
        <path d="M12 34C12 28.4772 16.4772 24 22 24H42C47.5228 24 52 28.4772 52 34V38C52 41.3137 49.3137 44 46 44H18C14.6863 44 12 41.3137 12 38V34Z" fill="#E5E5E5" stroke="#404040" strokeWidth="4"/>
        <rect x="18" y="30" width="8" height="8" rx="2" fill="#A3A3A3"/>
        <path d="M22 28V36" stroke="#A3A3A3" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 32H26" stroke="#A3A3A3" strokeWidth="4" strokeLinecap="round" />
        <circle cx="42" cy="30" r="3" fill="#F87171" className="controller-button a"/>
        <circle cx="36" cy="36" r="3" fill="#60A5FA" className="controller-button b"/>
    </svg>
  );
}
