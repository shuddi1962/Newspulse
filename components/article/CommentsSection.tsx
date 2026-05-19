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
      <div className="mb-8">
        {comments.map((comment, i) => (
          <div key={i} className="flex gap-3 border-b border-[#e5e7eb] py-4">
            <div
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
              style={{ backgroundColor: comment.color }}
            >
              {comment.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#0f1419]">{comment.name}</span>
                <span className="text-[10px] text-[#6b7280]">{comment.time}</span>
              </div>
              <p className="mt-1 text-[13px] leading-[1.6] text-[#374151]">{comment.text}</p>
              <button className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#e63946] hover:underline">
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <div>
        <h3 className="mb-4 text-[15px] font-bold text-[#0f1419]">Leave a Comment</h3>
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#e5e7eb] px-3 py-[10px] text-[13px] outline-none transition-colors focus:border-[#0f1419]"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#e5e7eb] px-3 py-[10px] text-[13px] outline-none transition-colors focus:border-[#0f1419]"
          />
        </div>
        <textarea
          placeholder="Write your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={4}
          className="mb-4 w-full resize-y border border-[#e5e7eb] px-3 py-[10px] text-[13px] outline-none transition-colors focus:border-[#0f1419]"
        />
        <button className="bg-[#0f1419] px-7 py-[11px] text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-[#e63946]">
          Post Comment
        </button>
      </div>
    </section>
  );
}
