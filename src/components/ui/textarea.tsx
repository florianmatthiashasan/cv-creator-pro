import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-[15px] leading-6 text-foreground ring-offset-background transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--organic-neutral-400)] hover:border-foreground/25 focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/[0.06] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
