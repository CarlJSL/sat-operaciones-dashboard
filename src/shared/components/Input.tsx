import { forwardRef } from 'react';
import type { ComponentProps } from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { cn } from '@/core/lib/utils';

interface InputProps extends ComponentProps<typeof ShadcnInput> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <ShadcnInput
          ref={ref}
          aria-invalid={!!error}
          className={cn(error && 'border-destructive focus-visible:ring-destructive/20', className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

