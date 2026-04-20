import { fetchAllTerminology, type BrandTerminology, type TerminologyStatus } from './brand-api'
import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TerminologyViolation {
  id: string
  term: string
  status: TerminologyStatus
  position: number
  length: number
  line: number
  column: number
  severity: 'ERROR' | 'WARNING' | 'INFO'
  replacement: string | null
  context: string
  matchedText: string
}

export interface TerminologyScanResult {
  violations: TerminologyViolation[]
  scannedAt: string
  totalTermsChecked: number
  forbiddenCount: number
  warningCount: number
  infoCount: number
}

// ---------------------------------------------------------------------------
// Core scanning function
// ---------------------------------------------------------------------------

function getLineAndColumn(text: string, position: number): { line: number; column: number } {
  const lines = text.slice(0, position).split('\n')
  return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 }
}

function severityForStatus(status: TerminologyStatus): 'ERROR' | 'WARNING' | 'INFO' {
  switch (status) {
    case 'FORBIDDEN':
      return 'ERROR'
    case 'REQUIRED':
      return 'INFO'
    case 'PREFERRED':
      return 'INFO'
  }
}

export function scanContent(
  text: string,
  terminology: BrandTerminology[],
): TerminologyScanResult {
  const violations: TerminologyViolation[] = []
  let violationId = 0

  for (const entry of terminology) {
    if (entry.status === 'FORBIDDEN') {
      // Scan for forbidden terms
      const escapedTerm = entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi')
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        violationId++
        const { line, column } = getLineAndColumn(text, match.index)
        violations.push({
          id: `tv-${violationId}`,
          term: entry.term,
          status: entry.status,
          position: match.index,
          length: match[0].length,
          line,
          column,
          severity: 'ERROR',
          replacement: entry.replacement,
          context: entry.context,
          matchedText: match[0],
        })
      }
    }
  }

  return {
    violations: violations.sort((a, b) => a.position - b.position),
    scannedAt: new Date().toISOString(),
    totalTermsChecked: terminology.length,
    forbiddenCount: violations.filter((v) => v.severity === 'ERROR').length,
    warningCount: violations.filter((v) => v.severity === 'WARNING').length,
    infoCount: violations.filter((v) => v.severity === 'INFO').length,
  }
}

// ---------------------------------------------------------------------------
// React hook: useTerminologyScanner
// ---------------------------------------------------------------------------

export function useTerminologyScanner(
  content: string,
  debounceMs = 300,
) {
  const [result, setResult] = useState<TerminologyScanResult | null>(null)
  const [terminology, setTerminology] = useState<BrandTerminology[]>([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load terminology on mount
  useEffect(() => {
    async function load() {
      try {
        const terms = await fetchAllTerminology('dev-localhost-token')
        setTerminology(terms)
      } catch {
        setTerminology([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Debounced scan
  const scan = useCallback(() => {
    if (!content.trim() || terminology.length === 0) {
      setResult(null)
      return
    }
    const scanResult = scanContent(content, terminology)
    setResult(scanResult)
  }, [content, terminology])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(scan, debounceMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [scan, debounceMs])

  return {
    result,
    loading,
    violations: result?.violations ?? [],
    hasErrors: (result?.forbiddenCount ?? 0) > 0,
    errorCount: result?.forbiddenCount ?? 0,
  }
}
