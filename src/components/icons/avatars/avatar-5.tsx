
import type { SVGProps } from "react";

export default function Avatar5(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="64" height="64" rx="32" fill="#E9D5FF"/>
        <rect x="20" y="40" width="24" height="6" rx="3" fill="#6B21A8"/>
        <circle cx="24" cy="28" r="3" fill="#6B21A8"/>
        <circle cx="40" cy="28" r="3" fill="#6B21A8"/>
    </svg>
  );
}
