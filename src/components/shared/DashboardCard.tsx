"use client";
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type DashboardCardTheme = 'blue' | 'emerald' | 'orange' | 'rose' | 'default';

interface DashboardCardProps extends React.ComponentProps<typeof Card> {
  theme?: DashboardCardTheme;
  headerClassName?: string;
  contentClassName?: string;
}

const themeStyles = {
  blue: { border: 'border-[#a7c5f9]', header: 'bg-[#eef4ff]', icon: 'text-[#5a8df2]', text: 'text-slate-800' },
  emerald: { border: 'border-[#a8e6cf]', header: 'bg-[#f0fbf7]', icon: 'text-[#4cb791]', text: 'text-slate-800' },
  orange: { border: 'border-[#fcd9a1]', header: 'bg-[#fffbf2]', icon: 'text-[#f0a635]', text: 'text-slate-800' },
  rose: { border: 'border-[#f8b4b4]', header: 'bg-[#fff5f5]', icon: 'text-[#e65c5c]', text: 'text-slate-800' },
  default: { border: 'border-[#e2e8f0]', header: 'bg-[#f8fafc]', icon: 'text-slate-600', text: 'text-slate-800' },
};

export function DashboardCard({
  className,
  headerClassName,
  contentClassName,
  theme = 'default',
  children,
  ...props
}: DashboardCardProps) {
  const style = themeStyles[theme];

  return (
    <Card className={cn('p-0 shadow-sm overflow-hidden rounded-2xl bg-white border', style.border, className)} {...props}>
      {children}
    </Card>
  );
}

export function DashboardCardHeader({
  className,
  theme = 'default',
  children,
  ...props
}: React.ComponentProps<typeof CardHeader> & { theme?: DashboardCardTheme }) {
  const style = themeStyles[theme];
  return (
    <CardHeader className={cn('m-0 border-b-0 pb-3 pt-4 px-6', style.header, className)} {...props}>
      {children}
    </CardHeader>
  );
}

export function DashboardCardTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return <CardTitle className={cn('text-base font-bold text-slate-800', className)} {...props} />;
}

export const DashboardCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <CardDescription ref={ref} className={cn("text-slate-500", className)} {...props} />
  )
)
DashboardCardDescription.displayName = "DashboardCardDescription"

export function DashboardCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-6 pb-6 pt-5', className)} {...props} />;
}

export function DashboardCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
    return <CardFooter className={cn('px-6 pb-6 pt-0 bg-transparent border-t-0', className)} {...props} />;
}
