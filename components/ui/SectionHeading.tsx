interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = '' }: SectionHeadingProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 bg-[#e63946]" />
        <h2 className="font-display text-xl font-bold tracking-tight text-[#0f1419] sm:text-2xl">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1.5 pl-4 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
