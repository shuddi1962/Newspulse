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
        'inline-block text-[9px] font-black uppercase tracking-widest px-[7px] py-[2px] text-white',
        className,
      )}
      style={{ backgroundColor: color || '#e63946' }}
    >
      {label}
    </span>
  );
}
