import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full resize-y border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-default)',
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
Textarea.displayName = 'Textarea';
