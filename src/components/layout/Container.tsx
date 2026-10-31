import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  width?: "text" | "tool";
  className?: string;
};

export function Container({ children, width = "text", className }: Props) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 sm:px-6",
        width === "text" ? "max-w-[720px]" : "max-w-[1100px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
