interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = '' }: SectionHeadingProps) {
  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-5 w-0.5 bg-[#dc2626]" />
        <h2 className="font-display text-lg font-semibold tracking-tight text-(--fg-default) sm:text-xl">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1 pl-3.5 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
