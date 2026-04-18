import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-(--color-ink-black) text-(--color-paper) hover:bg-(--color-ink-dark) focus-visible:ring-(--color-ink-black)',
        secondary:
          'border border-(--border-default) bg-(--bg-surface) text-(--fg-default) hover:bg-(--bg-muted) focus-visible:ring-(--color-ink-medium)',
        ghost:
          'text-(--fg-default) hover:bg-(--bg-muted) focus-visible:ring-(--color-ink-medium)',
        destructive:
          'bg-(--color-signal-red) text-white hover:brightness-110 focus-visible:ring-(--color-signal-red)',
        link:
          'h-auto p-0 text-(--fg-default) underline-offset-4 hover:underline focus-visible:ring-(--color-ink-medium)',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
