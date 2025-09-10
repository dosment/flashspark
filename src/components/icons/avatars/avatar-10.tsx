
import type { SVGProps } from "react";

export default function Avatar10(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#F5D0FE"/>
        <path d="M22 30C22 30 26 24 32 24C38 24 42 30 42 30" stroke="#701A75" strokeWidth="4" strokeLinecap="round"/>
        <path d="M22 44C22 44 26 50 32 50C38 50 42 44 42 44" stroke="#701A75" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
