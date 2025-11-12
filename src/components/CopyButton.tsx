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
    <span
      ref={buttonRef}
      className="terminal-copy"
      onClick={handleCopy}
      style={{ cursor: 'pointer' }}
    >
      Copy
    </span>
  )
}
