'use client'

interface WizardStep {
  label: string
  description?: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export default function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '16px 0 24px',
    }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isActive = idx === currentStep
        const isClickable = onStepClick && (isCompleted || isActive)

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : undefined }}>
            <button
              onClick={() => isClickable && onStepClick?.(idx)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                padding: '4px 0',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: '"Instrument Sans", sans-serif',
                flexShrink: 0,
                background: isCompleted
                  ? 'var(--color-blue, #000AFF)'
                  : isActive
                    ? 'var(--color-blue, #000AFF)'
                    : 'var(--color-bg-light, #F3F4F6)',
                color: isCompleted || isActive
                  ? '#fff'
                  : 'var(--color-text-gray, #6B7280)',
                transition: 'all 0.2s ease',
              }}>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 8 7 12 13 4" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? 'var(--color-text-dark, #1F2937)'
                  : isCompleted
                    ? 'var(--color-blue, #000AFF)'
                    : 'var(--color-text-gray, #6B7280)',
                transition: 'color 0.2s ease',
              }}>
                {step.label}
              </span>
            </button>

            {idx < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                margin: '0 12px',
                background: isCompleted
                  ? 'var(--color-blue, #000AFF)'
                  : 'var(--color-border, #E5E7EB)',
                borderRadius: '1px',
                transition: 'background 0.2s ease',
                minWidth: '24px',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
