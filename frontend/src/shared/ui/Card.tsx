import type { HTMLAttributes } from "react";

function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-crema-200 bg-white shadow-sm shadow-crema-200/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
