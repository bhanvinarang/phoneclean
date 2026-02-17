import { useState, useRef, useCallback } from 'react'

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

export default function FileUploader({ onFileSelected, uploading, uploadProgress }) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validate = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'csv'].includes(ext)) return 'Unsupported file type. Please upload .xlsx or .csv'
    if (file.size > 50 * 1024 * 1024) return 'File too large. Maximum size is 50MB.'
    return null
  }

  const handleFile = useCallback((file) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError('')
    setSelectedFile(file)
    onFileSelected(file)
  }, [onFileSelected])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const zoneStyle = {
    border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--border)'}`,
    borderRadius: 16,
    padding: '48px 32px',
    textAlign: 'center',
    cursor: uploading ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    background: dragging ? 'rgba(20,184,166,0.04)' : 'transparent',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={zoneStyle}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} disabled={uploading} />

        <div style={{ fontSize: 48, marginBottom: 16 }}>{selectedFile ? '📄' : '☁️'}</div>

        {selectedFile ? (
          <div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedFile.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatBytes(selectedFile.size)} · {selectedFile.name.split('.').pop().toUpperCase()}</p>
            {!uploading && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError('') }}
                style={{ marginTop: 10, fontSize: 13, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Choose different file
              </button>
            )}
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Drop your file here</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>or <span style={{ color: 'var(--brand)', textDecoration: 'underline' }}>browse to upload</span></p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Supports .xlsx and .csv — max 50MB</p>
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>Uploading & analysing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, overflow: 'hidden', background: 'var(--border)' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #14b8a6, #2dd4bf)', width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {['Excel (.xlsx)', 'CSV (.csv)'].map(fmt => (
          <div key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#10b981' }}>✓</span> {fmt}
          </div>
        ))}
      </div>
    </div>
  )
}
