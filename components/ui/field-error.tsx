import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  id?: string;
  children?: ReactNode;
  className?: string;
}

export function FieldError({ id, children, className }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn('text-xs text-(--color-signal-red)', className)}
    >
      {children}
    </p>
  );
}
