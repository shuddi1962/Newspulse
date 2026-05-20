'use client';

import { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface Comment {
  initials: string;
  color: string;
  name: string;
  time: string;
  text: string;
}

interface CommentsSectionProps {
  comments: Comment[];
}

export function CommentsSection({ comments }: CommentsSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');

  return (
    <section>
      <SectionHeading title={`Comments (${comments.length})`} />

      {/* Comments List */}
      <div className="mb-10">
        {comments.map((comment, i) => (
          <div key={i} className="flex gap-4 border-b border-[#e5e7eb] py-5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: comment.color }}
            >
              {comment.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0f1419]">{comment.name}</span>
                <span className="text-[11px] text-[#6b7280]">{comment.time}</span>
              </div>
              <p className="mt-2 text-sm leading-[1.65] text-[#374151]">{comment.text}</p>
              <button className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-[#dc2626] hover:underline">
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <div>
        <h3 className="mb-5 text-base font-bold text-[#0f1419]">Leave a Comment</h3>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#0f1419]"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#0f1419]"
          />
        </div>
        <textarea
          placeholder="Write your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={5}
          className="mb-5 w-full resize-y border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#0f1419]"
        />
        <button className="bg-[#0f1419] px-8 py-3 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-[#dc2626]">
          Post Comment
        </button>
      </div>
    </section>
  );
}
