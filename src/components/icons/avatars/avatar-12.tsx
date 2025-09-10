
import type { SVGProps } from "react";

export default function Avatar12(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#E0E7FF"/>
        <path d="M24 30L30 24L36 30" stroke="#3730A3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 44L30 38L36 44" stroke="#3730A3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
