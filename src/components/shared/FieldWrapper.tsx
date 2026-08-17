"use client";
/**
 * Lightweight form field wrappers without shadcn/ui Form dependency.
 * Uses react-hook-form directly.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FieldWrapper({
  label,
  error,
  description,
  children,
  className,
  htmlFor,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
