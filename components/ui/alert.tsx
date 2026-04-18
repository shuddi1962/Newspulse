import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex gap-3 border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-(--border-default) bg-(--bg-surface) text-(--fg-default)',
        info: 'border-(--border-default) bg-(--bg-muted) text-(--fg-default)',
        success:
          'border-(--color-signal-green) bg-(--bg-base) text-(--fg-default) [&>svg]:text-(--color-signal-green)',
        warning:
          'border-(--color-signal-amber) bg-(--bg-base) text-(--fg-default) [&>svg]:text-(--color-signal-amber)',
        destructive:
          'border-(--color-signal-red) bg-(--bg-base) text-(--color-signal-red) [&>svg]:text-(--color-signal-red)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, role = 'status', ...props }, ref) => (
    <div
      ref={ref}
      role={role}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-medium leading-snug text-current', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-(--fg-muted)', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
