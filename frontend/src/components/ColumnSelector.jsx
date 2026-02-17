export default function ColumnSelector({ allColumns, detectedColumns, selectedColumns, onSelectionChange }) {
  const toggle = (col) => {
    if (selectedColumns.includes(col)) {
      onSelectionChange(selectedColumns.filter(c => c !== col))
    } else {
      onSelectionChange([...selectedColumns, col])
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Select Phone Columns</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {detectedColumns.length > 0
              ? `${detectedColumns.length} column(s) auto-detected as phone numbers`
              : 'No columns auto-detected. Please select manually.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {detectedColumns.length > 0 && (
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onSelectionChange([...detectedColumns])}>
              ✦ Use detected
            </button>
          )}
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onSelectionChange([])}>
            Clear all
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
        {allColumns.map((col) => {
          const isDetected = detectedColumns.includes(col)
          const isSelected = selectedColumns.includes(col)
          return (
            <label key={col} onClick={() => toggle(col)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
              background: isSelected ? 'rgba(20,184,166,0.08)' : 'var(--bg-primary)',
              border: `1.5px solid ${isSelected ? 'rgba(20,184,166,0.5)' : 'var(--border)'}`,
              transition: 'all 0.15s ease',
              userSelect: 'none',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : 'var(--bg-card)',
                border: isSelected ? 'none' : '2px solid var(--border)',
                transition: 'all 0.15s ease',
              }}>
                {isSelected && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</p>
                {isDetected && <p style={{ fontSize: 11, color: 'var(--brand)' }}>📞 auto-detected</p>}
              </div>
            </label>
          )
        })}
      </div>

      {selectedColumns.length === 0 && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 13, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#d97706' }}>
          ⚠️ Please select at least one phone column to continue.
        </div>
      )}

      {selectedColumns.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 13, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)', color: 'var(--brand)' }}>
          ✓ <strong>{selectedColumns.length}</strong> column(s) selected: <em>{selectedColumns.join(', ')}</em>
        </div>
      )}
    </div>
  )
}
