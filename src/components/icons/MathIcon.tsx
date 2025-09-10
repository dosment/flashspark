
import type { SVGProps } from "react";

export default function MathIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="5" y="3" width="14" height="18" rx="2" fill="#E9D5FF" stroke="#A855F7" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="#A855F7" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="#A855F7" />
      <line x1="9" y1="15" x2="15" y2="15" stroke="#A855F7" />
      <line x1="12" y1="17" x2="12" y2="17" stroke="#A855F7" strokeWidth="3" />
    </svg>
  );
}
