
import type { SVGProps } from "react";

export default function Avatar8(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#FEE2E2"/>
        <path d="M20 40C20 37.7909 21.7909 36 24 36H40C42.2091 36 44 37.7909 44 40" stroke="#B91C1C" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="25" cy="28" r="2" fill="#B91C1C"/>
        <circle cx="39" cy="28" r="2" fill="#B91C1C"/>
    </svg>
  );
}
