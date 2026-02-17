'use client'

import { useRef } from 'react'

interface CopyButtonProps {
  text: string
}

export default function CopyButton({ text }: CopyButtonProps) {
  const buttonRef = useRef<HTMLSpanElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      if (buttonRef.current) {
        const originalText = buttonRef.current.textContent
        buttonRef.current.textContent = 'Copied!'
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.textContent = originalText
          }
        }, 2000)
      }
    })
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className="terminal-copy"
      onClick={handleCopy}
      type="button"
      aria-label="Copy to clipboard"
      style={{ cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', color: 'inherit', padding: 0 }}
    >
      Copy
    </button>
  )
}
