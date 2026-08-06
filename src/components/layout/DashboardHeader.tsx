"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps extends React.ComponentProps<'div'> {
  title?: string;
  showSeparator?: boolean; // kept for interface compatibility if used somewhere
}

export function DashboardHeader({
  className,
  title,
  showSeparator = true,
  children,
  ...props
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 mb-6',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {title && (
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
