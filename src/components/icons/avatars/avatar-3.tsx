
import type { SVGProps } from "react";

export default function Avatar3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .eye-left-squin {
                    animation: eye-squint-3 3.5s ease-in-out infinite;
                    transform-origin: 24px 28px;
                }
                 .eye-right-squin {
                    animation: eye-squint-3 3.5s ease-in-out infinite;
                    transform-origin: 40px 28px;
                }
                @keyframes eye-squint-3 {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }
            `}
        </style>
        <rect width="64" height="64" rx="32" fill="#FECACA"/>
        <path d="M24 44C24 44 26.6274 38 32 38C37.3726 38 40 44 40 44" stroke="#991B1B" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 28L30 32" stroke="#991B1B" strokeWidth="4" strokeLinecap="round" className="eye-left-squin" />
        <path d="M40 28L34 32" stroke="#991B1B" strokeWidth="4" strokeLinecap="round" className="eye-right-squin"/>
    </svg>
  );
}
