import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200',
            'bg-white placeholder:text-slate-400 text-slate-900',
            'focus:outline-none focus:ring-4 resize-none',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/10',
            'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
