import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-md border border-white/10 bg-black/20 px-3.5 py-3 text-sm leading-6 text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)] ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-accent/40 focus-visible:border-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
