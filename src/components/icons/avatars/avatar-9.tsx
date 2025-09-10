
import type { SVGProps } from "react";

export default function Avatar9(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#DBEAFE"/>
        <path d="M20 44L26 38L32 44L38 38L44 44" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="22" y="24" width="6" height="6" fill="#1E40AF"/>
        <rect x="36" y="24" width="6" height="6" fill="#1E40AF"/>
    </svg>
  );
}
