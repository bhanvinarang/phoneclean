import { useState, useEffect } from 'react'
import FileUploader from './components/FileUploader.jsx'
import ColumnSelector from './components/ColumnSelector.jsx'
import CleaningOptions from './components/CleaningOptions.jsx'
import PreviewTable from './components/PreviewTable.jsx'
import MetricsDashboard from './components/MetricsDashboard.jsx'
import Stepper from './components/Stepper.jsx'
import ToastContainer, { toast } from './components/Toast.jsx'
import { uploadFile, cleanData, getDownloadUrl, getReportUrl } from './utils/api.js'

const DEFAULT_OPTIONS = {
  keepIndianOnly: true,
  removeCountryCode: true,
  mergeColumns: false,
  removeDuplicates: true,
  dropEmptyRows: false,
  whatsappFormat: false,
}

export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cleaning, setCleaning] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [activePreset, setActivePreset] = useState('Standard')
  const [cleanResult, setCleanResult] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleFileSelected = async (file) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const result = await uploadFile(file, setUploadProgress)
      setUploadResult(result)
      setSessionId(result.session_id)
      setSelectedColumns(result.detected_phone_columns)
      toast({ message: `Uploaded! ${result.detected_phone_columns.length} phone column(s) auto-detected.`, type: 'success' })
      setStep(2)
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Upload failed. Please try again.', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleClean = async () => {
    if (!selectedColumns.length) {
      toast({ message: 'Please select at least one phone column.', type: 'warning' })
      return
    }
    setCleaning(true)
    try {
      const result = await cleanData({
        session_id: sessionId,
        selected_columns: selectedColumns,
        keep_indian_only: options.keepIndianOnly,
        remove_country_code: options.removeCountryCode,
        merge_columns: options.mergeColumns,
        remove_duplicates: options.removeDuplicates,
        drop_empty_rows: options.dropEmptyRows,
        whatsapp_format: options.whatsappFormat,
      })
      setCleanResult(result)
      toast({ message: `Done! ${result.metrics.valid_numbers.toLocaleString()} valid numbers found.`, type: 'success' })
      setStep(4)
    } catch (err) {
      toast({ message: err?.response?.data?.detail || 'Cleaning failed. Please try again.', type: 'error' })
    } finally {
      setCleaning(false)
    }
  }

  const handleDownload = () => {
    const url = getDownloadUrl(sessionId)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleaned_contacts.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast({ message: 'Download started!', type: 'success' })
    setStep(5)
  }

  const handleDownloadReport = () => {
    const url = getReportUrl(sessionId)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleaning_report.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const reset = () => {
    setStep(1)
    setSessionId(null)
    setUploadResult(null)
    setSelectedColumns([])
    setOptions(DEFAULT_OPTIONS)
    setActivePreset('Standard')
    setCleanResult(null)
  }

  /* ── Shared card style ── */
  const card = { padding: 32, marginBottom: 0 }
  const navRow = { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, flexWrap: 'wrap' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: dark ? 'rgba(17,31,53,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'linear-gradient(135deg,#14b8a6,#0d9488)' }}>📱</div>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1 }}>PhoneClean</h1>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1, marginTop: 2 }}>Indian Number Cleaner</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            API Docs
          </a>
          <button onClick={() => setDark(d => !d)}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ── Hero band ── */}
      <div style={{ padding: '40px 24px 24px', background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, transparent 70%)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: 'rgba(20,184,166,0.1)', color: 'var(--brand)', border: '1px solid rgba(20,184,166,0.2)', marginBottom: 14 }}>
          ✦ No-code phone number cleaning for HR &amp; marketing teams
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 34, color: 'var(--text-primary)', marginBottom: 8 }}>Clean your contact database</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Upload Excel or CSV, auto-detect phone columns, get perfectly cleaned Indian numbers — in seconds.</p>
      </div>

      {/* ── Main ── */}
      <main style={{ padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <Stepper currentStep={step} />

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="glass-card" style={card}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Upload your contact file</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>We support Excel (.xlsx) and CSV files with any column structure.</p>
            <FileUploader onFileSelected={handleFileSelected} uploading={uploading} uploadProgress={uploadProgress} />
          </div>
        )}

        {/* STEP 2: Columns + Preview */}
        {step === 2 && uploadResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={card}>
              <ColumnSelector
                allColumns={uploadResult.all_columns}
                detectedColumns={uploadResult.detected_phone_columns}
                selectedColumns={selectedColumns}
                onSelectionChange={setSelectedColumns}
              />
            </div>
            <div className="glass-card" style={card}>
              <PreviewTable preview={uploadResult.preview} title="📁 File Preview (first 20 rows)" highlightCols={selectedColumns} />
            </div>
            <div style={navRow}>
              <button className="btn-secondary" onClick={reset}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={selectedColumns.length === 0}>
                Set Cleaning Options →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Options */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={card}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Cleaning Options</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Configure how phone numbers should be cleaned and formatted.</p>
              <CleaningOptions options={options} onChange={setOptions} activePreset={activePreset} onPresetChange={setActivePreset} />
            </div>
            <div style={navRow}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" onClick={handleClean} disabled={cleaning}>
                {cleaning ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                    </svg>
                    Cleaning…
                  </>
                ) : '✨ Clean Data →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Preview + Metrics */}
        {step === 4 && cleanResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <MetricsDashboard metrics={cleanResult.metrics} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <PreviewTable preview={cleanResult.before_preview} title="📁 Before Cleaning" highlightCols={selectedColumns} />
              </div>
              <div className="glass-card" style={{ padding: 24 }}>
                <PreviewTable preview={cleanResult.after_preview} title="✅ After Cleaning" highlightCols={cleanResult.cleaned_columns} />
              </div>
            </div>
            <div style={navRow}>
              <button className="btn-secondary" onClick={() => setStep(3)}>← Adjust Options</button>
              <button className="btn-secondary" onClick={handleDownloadReport}>📄 Export Report</button>
              <button className="btn-primary" onClick={handleDownload}>📥 Download Cleaned File</button>
            </div>
          </div>
        )}

        {/* STEP 5: Done */}
        {step === 5 && (
          <div className="glass-card" style={{ ...card, textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 26, color: 'var(--text-primary)', marginBottom: 10 }}>All done!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Your cleaned file is downloading.</p>
            {cleanResult?.metrics && (
              <div style={{ display: 'inline-flex', gap: 32, padding: '16px 32px', borderRadius: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', marginBottom: 32 }}>
                {[
                  { v: cleanResult.metrics.valid_numbers, l: 'Valid', c: 'var(--success)' },
                  { v: cleanResult.metrics.invalid_removed, l: 'Removed', c: 'var(--danger)' },
                  { v: cleanResult.metrics.duplicates_removed, l: 'Deduped', c: 'var(--warning)' },
                ].map((m, i, arr) => (
                  <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 700, color: m.c }}>{m.v.toLocaleString()}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.l}</p>
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 1, height: 40, background: 'var(--border)' }} />}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={handleDownload}>📥 Download Again</button>
              <button className="btn-secondary" onClick={handleDownloadReport}>📄 Download Report</button>
              <button className="btn-primary" onClick={reset}>🔄 Clean Another File</button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '20px 24px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
        PhoneClean — Built for HR teams, marketers &amp; operations staff.
      </footer>

      <ToastContainer />
    </div>
  )
}
