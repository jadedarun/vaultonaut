export default function TableRenderer({ headers = [], rows = [] }) {
  if (!headers.length && !rows.length) return null;

  return (
    <div
      style={{
        margin: '0.8rem 0',
        overflowX: 'auto',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem',
          textAlign: 'left'
        }}
      >
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '0.6rem 0.9rem', color: 'var(--color-arctic-1)', fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              style={{
                background: rIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.035)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} style={{ padding: '0.55rem 0.9rem', color: 'var(--color-arctic-1)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
