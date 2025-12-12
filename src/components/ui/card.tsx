// src/components/ui/card.tsx
import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("border-b border-slate-800 px-4 py-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: DivProps) {
  return (
    <h2
      className={cn("font-semibold tracking-tight text-sm", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("px-4 py-3 space-y-2 text-sm text-slate-200", className)}
      {...props}
    />
  );
}
