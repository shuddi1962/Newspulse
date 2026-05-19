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
    <div className="mb-7 flex gap-4 border-l-4 border-[#0f1419] bg-[#f8f9fa] p-5">
      <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[#0f1419] text-[22px] font-bold text-white">
        {author.initials}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-[#0f1419]">{author.name}</h4>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#e63946]">
          {author.role}
        </p>
        <p className="text-[13px] leading-[1.6] text-[#6b7280]">{author.bio}</p>
      </div>
    </div>
  );
}
