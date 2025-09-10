
import type { SVGProps } from "react";

export default function Avatar3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#FECACA"/>
        <path d="M24 44C24 44 26.6274 38 32 38C37.3726 38 40 44 40 44" stroke="#991B1B" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 28L30 32" stroke="#991B1B" strokeWidth="4" strokeLinecap="round"/>
        <path d="M40 28L34 32" stroke="#991B1B" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
