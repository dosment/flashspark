
import type { SVGProps } from "react";

export default function ScienceIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="1.5" fill="#10B981" stroke="#10B981" />
      <path
        d="M19.07 4.93a10 10 0 0 0-14.14 0"
        stroke="#10B981"
        strokeDasharray="2 3"
      />
      <path
        d="M4.93 19.07a10 10 0 0 0 14.14 0"
        stroke="#10B981"
        strokeDasharray="2 3"
      />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#10B981" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(60 12 12)"
        stroke="#10B981"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(120 12 12)"
        stroke="#10B981"
      />
    </svg>
  );
}

    