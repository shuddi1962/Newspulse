interface AuthorBioProps {
  author: {
    name: string;
    initials: string;
    role: string;
    bio: string;
  };
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="mb-8 flex gap-5 border-l-4 border-[#0f1419] bg-[#f8f9fa] p-6">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0f1419] text-2xl font-bold text-white">
        {author.initials}
      </div>
      <div>
        <h4 className="text-base font-bold text-[#0f1419]">{author.name}</h4>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#e63946]">
          {author.role}
        </p>
        <p className="text-sm leading-[1.65] text-[#6b7280]">{author.bio}</p>
      </div>
    </div>
  );
}
