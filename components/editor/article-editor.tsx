'use client';

import { useEditor, EditorContent, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useCallback, useEffect, useImperativeHandle } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ArticleEditorHandle = {
  getJSON: () => JSONContent;
  getHTML: () => string;
  getText: () => string;
  getCharacterCount: () => number;
};

type ArticleEditorProps = {
  initialContent?: JSONContent | null;
  placeholder?: string;
  onChange?: (json: JSONContent) => void;
  className?: string;
  editorRef?: React.Ref<ArticleEditorHandle>;
};

export function ArticleEditor({
  initialContent,
  placeholder = 'Start writing your article…',
  onChange,
  className,
  editorRef,
}: ArticleEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-neutral max-w-none min-h-[28rem] px-6 py-5 focus:outline-none',
          'prose-headings:font-display prose-headings:tracking-tight',
          'prose-p:leading-relaxed prose-a:text-(--color-ink-black) prose-a:underline-offset-4',
          'prose-blockquote:border-l-(--color-signal-red) prose-blockquote:text-(--fg-muted)',
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getJSON());
    },
  });

  useImperativeHandle(
    editorRef,
    () => ({
      getJSON: () => editor?.getJSON() ?? { type: 'doc', content: [] },
      getHTML: () => editor?.getHTML() ?? '',
      getText: () => editor?.getText() ?? '',
      getCharacterCount: () => editor?.storage.characterCount?.characters() ?? 0,
    }),
    [editor],
  );

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-(--bg-muted)" />
        <div className="mt-6 h-64 animate-pulse rounded bg-(--bg-muted)" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-(--border-default) bg-(--bg-surface) shadow-sm',
        className,
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <EditorFooter editor={editor} />
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const setImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-(--border-subtle) px-3 py-2"
    >
      <ToolbarButton
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
      >
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
      >
        <Code size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton label="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton label="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Link" onClick={setLink} active={editor.isActive('link')}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={setImage}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 size={16} />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active ?? undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded text-(--fg-muted) transition-colors',
        'hover:bg-(--bg-muted) hover:text-(--fg-default)',
        'disabled:pointer-events-none disabled:opacity-40',
        active && 'bg-(--bg-muted) text-(--fg-default)',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-(--border-subtle)" />;
}

function EditorFooter({ editor }: { editor: Editor }) {
  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const words = editor.storage.characterCount?.words?.() ?? 0;
  return (
    <div className="flex items-center justify-end gap-4 border-t border-(--border-subtle) px-4 py-2 text-xs text-(--fg-subtle)">
      <span>{words.toLocaleString()} words</span>
      <span aria-hidden="true">·</span>
      <span>{chars.toLocaleString()} characters</span>
    </div>
  );
}
