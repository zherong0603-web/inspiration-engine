import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loading({ className, size = 'md', text, ...props }: LoadingProps) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)} {...props}>
      <div
        className={cn(
          'animate-spin rounded-full border-violet-200 border-t-violet-600',
          sizes[size]
        )}
      />
      {text && <p className="text-slate-600 text-sm">{text}</p>}
    </div>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded-lg', className)}
      {...props}
    />
  );
}
