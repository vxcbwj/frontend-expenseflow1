// components/ui/progress.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number; // default 100
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure value is between 0 and max
    const percentage = Math.min(Math.max(value, 0), max);
    const widthPercentage = (percentage / max) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{
            transform: `translateX(-${100 - widthPercentage}%)`,
            width: `${widthPercentage}%`,
          }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
