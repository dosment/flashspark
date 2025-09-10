
import type { SVGProps } from "react";

export default function HistoryIcon(props: SVGProps<SVGSVGElement>) {
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
      <path
        d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="#FEF3C7"
        stroke="#FBBF24"
      />
      <path d="M8 4v16" stroke="#FBBF24" />
      <path
        d="M16 4v16"
        stroke="#FBBF24"
      />
      <path
        d="M10 4c-2 0-2 2-2 2s0-2 2-2"
        fill="none"
        stroke="#FBBF24"
      />
       <path
        d="M14 4c2 0 2 2 2 2s0-2-2-2"
        fill="none"
        stroke="#FBBF24"
      />
       <path
        d="M10 20c-2 0-2-2-2-2s0 2 2 2"
        fill="none"
        stroke="#FBBF24"
      />
       <path
        d="M14 20c2 0 2-2 2-2s0 2 2 2"
        fill="none"
        stroke="#FBBF24"
      />
    </svg>
  );
}
