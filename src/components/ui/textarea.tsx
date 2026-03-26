import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full rounded-[22px] border border-input bg-white px-4 py-3 text-sm text-foreground ring-offset-background transition-all duration-300 placeholder:text-muted-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:bg-orange-50/45 disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_14px_30px_-28px_rgba(84,56,24,0.35)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
