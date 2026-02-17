import { useState } from 'react'

export default function PreviewTable({ preview, title, highlightCols = [] }) {
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  if (!preview) return null

  const { columns, rows, total_rows } = preview
  const pageCount = Math.ceil(rows.length / PAGE_SIZE)
  const visibleRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const isPhone = (col) => highlightCols.includes(col)
  const isInvalid = (col, val) => isPhone(col) && (val === null || val === 'None' || val === 'nan' || val === '')
  const isValid = (col, val) => isPhone(col) && val && val !== 'None' && val !== 'nan' && val !== ''

  const display = (val) => (val === null || val === 'None' || val === 'nan' || val === '') ? '—' : val

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{title}</h3>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontFamily: 'JetBrains Mono', background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          {(total_rows || 0).toLocaleString()} rows total
        </span>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', width: 40 }}>#</th>
              {columns.map(col => (
                <th key={col} style={{
                  padding: '10px 12px', textAlign: 'left', fontWeight: isPhone(col) ? 600 : 500,
                  color: isPhone(col) ? 'var(--brand)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {isPhone(col) && '📞 '}{col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)',
              }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                  {page * PAGE_SIZE + i + 1}
                </td>
                {columns.map(col => {
                  const val = row[col]
                  const invalid = isInvalid(col, val)
                  const valid = isValid(col, val)
                  return (
                    <td key={col} style={{
                      padding: '8px 12px',
                      color: invalid ? 'var(--danger)' : valid ? 'var(--success)' : 'var(--text-primary)',
                      fontFamily: valid ? 'JetBrains Mono' : 'inherit',
                      fontWeight: (invalid || valid) ? 500 : 400,
                      maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {display(val)}
                    </td>
                  )
                })}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {page + 1} of {pageCount}</span>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page === pageCount - 1}>Next →</button>
        </div>
      )}
    </div>
  )
}
