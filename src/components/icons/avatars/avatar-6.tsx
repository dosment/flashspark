
import type { SVGProps } from "react";

export default function Avatar6(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#FED7AA"/>
        <path d="M22 26L28 32L22 38" stroke="#9A3412" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 26L36 32L42 38" stroke="#9A3412" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 44H40" stroke="#9A3412" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
