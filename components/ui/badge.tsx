import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.2em]',
  {
    variants: {
      variant: {
        neutral:
          'border-(--border-subtle) bg-transparent text-(--fg-muted)',
        solid:
          'border-(--color-ink-black) bg-(--color-ink-black) text-(--color-paper)',
        outline:
          'border-(--border-default) bg-(--bg-surface) text-(--fg-default)',
        success:
          'border-(--color-signal-green) bg-transparent text-(--color-signal-green)',
        warning:
          'border-(--color-signal-amber) bg-transparent text-(--color-signal-amber)',
        destructive:
          'border-(--color-signal-red) bg-transparent text-(--color-signal-red)',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { badgeVariants };
