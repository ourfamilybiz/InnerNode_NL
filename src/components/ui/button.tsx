// src/components/ui/button.tsx
import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const variantClass =
    variant === "outline"
      ? "border border-slate-700 bg-transparent text-slate-100 hover:border-cyan-400 hover:text-cyan-200"
      : variant === "ghost"
      ? "text-slate-200 hover:bg-slate-800/60"
      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400";

  const sizeClass =
    size === "sm"
      ? "h-8 px-3 text-xs"
      : size === "lg"
      ? "h-11 px-5 text-sm"
      : "h-9 px-4 text-sm";

  return (
    <button
      className={cn(base, variantClass, sizeClass, className)}
      {...props}
    />
  );
};
