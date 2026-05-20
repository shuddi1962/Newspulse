import { cn } from '@/lib/utils';

interface CategoryTagProps {
  label: string;
  color?: string;
  className?: string;
}

export function CategoryTag({ label, color, className }: CategoryTagProps) {
  return (
    <span
      className={cn(
        'inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 text-white',
        className,
      )}
      style={{ backgroundColor: color || '#dc2626' }}
    >
      {label}
    </span>
  );
}
