import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'gradient';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-xl transition-all duration-300';

    const variants = {
      default: 'p-6 border border-slate-200 shadow-sm',
      interactive: 'p-6 border-2 border-slate-200 cursor-pointer hover:border-violet-500',
      gradient: 'p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200',
    };

    const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-1' : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
