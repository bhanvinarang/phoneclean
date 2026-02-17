const STEPS = [
  { id: 1, label: 'Upload', icon: '☁️' },
  { id: 2, label: 'Columns', icon: '📋' },
  { id: 3, label: 'Options', icon: '⚙️' },
  { id: 4, label: 'Preview', icon: '👁️' },
  { id: 5, label: 'Download', icon: '📥' },
]

export default function Stepper({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((step, idx) => {
        const isComplete = currentStep > step.id
        const isActive = currentStep === step.id
        const isLast = idx === STEPS.length - 1

        const nodeBg = isComplete
          ? '#10b981'
          : isActive
          ? 'linear-gradient(135deg, #14b8a6, #0d9488)'
          : 'var(--bg-primary)'

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'all 0.3s ease',
                background: nodeBg,
                color: (isComplete || isActive) ? 'white' : 'var(--text-secondary)',
                border: (!isComplete && !isActive) ? '2px solid var(--border)' : 'none',
                boxShadow: isActive ? '0 4px 12px rgba(20,184,166,0.4)' : 'none',
              }}>
                {isComplete ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: 11, marginTop: 6, fontWeight: 500,
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                transition: 'color 0.2s',
              }}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div style={{
                height: 2, width: 48, margin: '0 4px 18px 4px', borderRadius: 99,
                background: isComplete
                  ? 'linear-gradient(90deg, #14b8a6, #10b981)'
                  : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
