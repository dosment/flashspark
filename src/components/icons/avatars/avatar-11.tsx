
import type { SVGProps } from "react";

export default function Avatar11(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#FEF9C3"/>
        <path d="M24 24H40" stroke="#854D0E" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 24V32" stroke="#854D0E" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 44C24 39.5817 27.5817 36 32 36C36.4183 36 40 39.5817 40 44" stroke="#854D0E" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
