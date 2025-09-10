
import type { SVGProps } from "react";

export default function Avatar4(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#BFDBFE"/>
        <path d="M24 44C24 44 26.6274 48 32 48C37.3726 48 40 44 40 44" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 28C24 25.7909 25.7909 24 28 24V24C30.2091 24 32 25.7909 32 28V32C32 34.2091 30.2091 36 28 36V36C25.7909 36 24 34.2091 24 32V28Z" fill="#1E40AF"/>
        <path d="M32 28C32 25.7909 33.7909 24 36 24V24C38.2091 24 40 25.7909 40 28V32C40 34.2091 38.2091 36 36 36V36C33.7909 36 32 34.2091 32 32V28Z" fill="#1E40AF"/>
    </svg>
  );
}
