import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-default)',
        'placeholder:text-(--fg-subtle)',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ink-medium) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base)',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-[invalid=true]:border-(--color-signal-red) aria-[invalid=true]:focus-visible:ring-(--color-signal-red)',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
