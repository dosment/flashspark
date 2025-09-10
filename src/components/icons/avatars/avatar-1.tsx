
import type { SVGProps } from "react";

export default function Avatar1(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#FDE68A"/>
        <path d="M20 44C20 37.3726 25.3726 32 32 32C38.6274 32 44 37.3726 44 44" stroke="#A16207" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="24" cy="28" r="4" fill="#A16207"/>
        <circle cx="40" cy="28" r="4" fill="#A16207"/>
    </svg>
  );
}
