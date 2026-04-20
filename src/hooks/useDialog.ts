'use client'

import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Hook for accessible dialog behavior:
 * - Returns a ref to attach to the dialog container
 * - Traps focus inside the dialog
 * - Handles Escape key to close
 * - Restores focus to the previously focused element on close
 */
export function useDialog(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store the previously-focused element when the dialog opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null

      // Focus the first focusable element inside the dialog
      requestAnimationFrame(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        const firstFocusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        if (firstFocusable) {
          firstFocusable.focus()
        } else {
          // If no focusable children, focus the dialog itself
          dialog.focus()
        }
      })
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return dialogRef
}
