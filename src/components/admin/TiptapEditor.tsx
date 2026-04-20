'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { useCallback, useEffect } from 'react'

// tiptap-markdown extends editor.storage but doesn't ship types
interface MarkdownStorage {
  markdown: { getMarkdown: () => string }
}

interface TiptapEditorProps {
  content: string // markdown
  onChange: (markdown: string) => void
  placeholder?: string
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      const md = (ed.storage as unknown as MarkdownStorage).markdown.getMarkdown()
      onChange(md)
    },
    immediatelyRender: false,
  })

  // Sync external content changes (e.g. loading a post for edit)
  useEffect(() => {
    if (editor && content !== (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown()) {
      editor.commands.setContent(content)
    }
    // Only re-sync when content prop changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return <div className="tiptap-loading">Loading editor...</div>

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('bold') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('italic') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </button>
        <span className="tiptap-divider" />
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('heading', { level: 1 }) ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('heading', { level: 2 }) ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('heading', { level: 3 }) ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </button>
        <span className="tiptap-divider" />
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('bulletList') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          &bull; List
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('orderedList') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          1. List
        </button>
        <span className="tiptap-divider" />
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('blockquote') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('codeBlock') ? ' active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          {'<>'} Code
        </button>
        <span className="tiptap-divider" />
        <button
          type="button"
          className="tiptap-btn"
          onClick={addImage}
          title="Insert Image"
        >
          Image
        </button>
        <button
          type="button"
          className={`tiptap-btn${editor.isActive('link') ? ' active' : ''}`}
          onClick={addLink}
          title="Insert Link"
        >
          Link
        </button>
      </div>

      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
