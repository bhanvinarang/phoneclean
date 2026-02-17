import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#14b8a6', '#ef4444', '#f59e0b', '#6366f1']

function MetricCard({ value, label, sub, color, icon }) {
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 32, fontFamily: 'Syne', fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginTop: 6 }}>{label}</p>
          {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28, opacity: 0.8 }}>{icon}</span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
        <p style={{ fontWeight: 600 }}>{payload[0].name}</p>
        <p style={{ color: payload[0].fill || payload[0].color }}>{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function MetricsDashboard({ metrics }) {
  if (!metrics) return null
  const { total_records, valid_numbers, invalid_removed, duplicates_removed, rows_after_cleaning } = metrics
  const validPct = total_records > 0 ? Math.round((valid_numbers / total_records) * 100) : 0

  const pieData = [
    { name: 'Valid', value: valid_numbers },
    { name: 'Invalid', value: invalid_removed },
    { name: 'Duplicates', value: duplicates_removed },
  ].filter(d => d.value > 0)

  const barData = [
    { name: 'Total', value: total_records, fill: '#6366f1' },
    { name: 'Valid', value: valid_numbers, fill: '#14b8a6' },
    { name: 'Invalid', value: invalid_removed, fill: '#ef4444' },
    { name: 'Dupes', value: duplicates_removed, fill: '#f59e0b' },
    { name: 'Output', value: rows_after_cleaning, fill: '#14b8a6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <MetricCard value={total_records} label="Total Records" icon="📊" />
        <MetricCard value={valid_numbers} label="Valid Numbers" sub={`${validPct}% of total`} color="var(--success)" icon="✅" />
        <MetricCard value={invalid_removed} label="Invalid Removed" color="var(--danger)" icon="🚫" />
        <MetricCard value={duplicates_removed} label="Duplicates Removed" color="var(--warning)" icon="🔁" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16 }}>Number Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((entry, i) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{entry.name}</span>
                  <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 500, color: 'var(--text-primary)' }}>{entry.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Output rows</p>
                <p style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 700, color: 'var(--brand)' }}>{rows_after_cleaning.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16 }}>Cleaning Summary</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
