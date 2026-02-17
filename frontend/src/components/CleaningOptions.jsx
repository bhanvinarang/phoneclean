const PRESETS = {
  'Standard': { keepIndianOnly: true, removeCountryCode: true, mergeColumns: false, removeDuplicates: true, dropEmptyRows: false, whatsappFormat: false },
  'WhatsApp Export': { keepIndianOnly: true, removeCountryCode: false, mergeColumns: true, removeDuplicates: true, dropEmptyRows: true, whatsappFormat: true },
  'Deduplication Only': { keepIndianOnly: false, removeCountryCode: false, mergeColumns: false, removeDuplicates: true, dropEmptyRows: false, whatsappFormat: false },
}

const TOGGLE_DEFS = [
  { key: 'keepIndianOnly', label: 'Keep only Indian numbers', desc: 'Remove numbers that don\'t start with 6-9 (10-digit Indian mobile format)', tip: 'Valid Indian mobiles: 10 digits starting with 6, 7, 8 or 9' },
  { key: 'removeCountryCode', label: 'Remove country code', desc: 'Strip +91 / 91 / 0091 prefix and return plain 10-digit number', tip: 'e.g. +919876543210 → 9876543210' },
  { key: 'mergeColumns', label: 'Merge phone columns into one', desc: 'Combine all selected phone columns, keeping the first valid number per row', tip: 'Useful when you have Phone1, Phone2, Mobile etc.' },
  { key: 'removeDuplicates', label: 'Remove duplicate numbers', desc: 'Mark second occurrence of any duplicate phone number as invalid', tip: 'Keeps only the first occurrence of each unique number' },
  { key: 'dropEmptyRows', label: 'Drop rows with no valid number', desc: 'Remove entire rows where all selected phone columns are invalid', tip: 'Creates a clean list of only reachable contacts' },
  { key: 'whatsappFormat', label: 'WhatsApp format (+91XXXXXXXXXX)', desc: 'Prefix all valid numbers with +91 for WhatsApp bulk import', tip: 'Outputs: +919876543210' },
]

function Toggle({ label, desc, tip, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          <div className="tooltip-wrapper" style={{ position: 'relative' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--border)', color: 'var(--text-secondary)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>?</div>
            <div className="tooltip-box">{tip}</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
          background: checked ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : 'var(--border)',
          position: 'relative', flexShrink: 0, transition: 'background 0.2s ease',
        }}>
        <span style={{
          position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%',
          background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease',
          left: checked ? 24 : 4,
        }} />
      </button>
    </div>
  )
}

export default function CleaningOptions({ options, onChange, activePreset, onPresetChange }) {
  const updateOption = (key, val) => {
    onPresetChange(null)
    onChange({ ...options, [key]: val })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Presets */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 10 }}>Quick Presets</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.keys(PRESETS).map((name) => (
            <button key={name} onClick={() => { onPresetChange(name); onChange(PRESETS[name]) }}
              style={{
                padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s ease', border: 'none',
                background: activePreset === name ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : 'var(--bg-primary)',
                color: activePreset === name ? 'white' : 'var(--text-secondary)',
                border: activePreset === name ? 'none' : '1.5px solid var(--border)',
                boxShadow: activePreset === name ? '0 4px 12px rgba(20,184,166,0.3)' : 'none',
              }}>
              {name === 'Standard' ? '⚙️ ' : name === 'WhatsApp Export' ? '💬 ' : '🔁 '}{name}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="glass-card" style={{ padding: '0 24px' }}>
        {TOGGLE_DEFS.map((def, i) => (
          <div key={def.key} style={{ borderBottom: i === TOGGLE_DEFS.length - 1 ? 'none' : undefined }}>
            <Toggle
              label={def.label}
              desc={def.desc}
              tip={def.tip}
              checked={options[def.key]}
              onChange={(v) => updateOption(def.key, v)}
            />
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 12, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--brand)' }}>Always applied:</strong> Strip non-digits → normalise +91/91/0091 → validate 10-digit Indian format → mark invalid as empty
      </div>
    </div>
  )
}
